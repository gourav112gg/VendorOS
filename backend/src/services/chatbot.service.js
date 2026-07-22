const axios = require("axios");
const Order = require("../models/Order");
const User = require("../models/User");
const Inventory = require("../models/Inventory");
const Company = require("../models/Company");
const CompanyPolicy = require("../models/CompanyPolicy");
const { computeRisk } = require("./risk.service");
const { getHistory, appendToHistory } = require("../utils/chatMemory");
const { saveDraft, getDraft, clearDraft } = require("../utils/orderDraft");

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const CHAT_MODEL = "llama-3.3-70b-versatile";

const tools = [
  {
    type: "function",
    function: {
      name: "get_order_status",
      description:
        "Get the status, delivery info, and details of ONE specific order by its order ID. NOTE: this does NOT include payment information — there is no payment tool available.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The MongoDB _id of the order" },
        },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_my_orders",
      description:
        "List recent orders relevant to the current user (their own orders if customer, assigned orders if worker/manager, all company orders if owner). Use this when the user asks something like 'where is my order' without giving a specific order ID, or 'what orders do I have'.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_order_risk",
      description:
        "Calculate the delay risk for ONE specific order (owner/manager only) — how likely it is to be late, with a plain-English reason and suggested action.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The MongoDB _id of the order" },
        },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_worker_availability",
      description:
        "Check which workers are Free or Busy (owner/manager only). Can optionally filter by a worker's name.",
      parameters: {
        type: "object",
        properties: {
          workerName: { type: "string", description: "Optional partial name to search for a specific worker" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_inventory_stock",
      description:
        "Check current stock/quantity of raw materials or products in inventory (owner/manager only). Can optionally filter by product name.",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string", description: "Optional partial product name to search for" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_company_info",
      description:
        "Get general information about the current user's company — name, description, address, minimum order rules — plus basic stats like total workers and total/active orders. Use this for questions like 'company ke baare mein batao', 'company ka address kya hai', 'kitne workers hain'.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_company_policy",
      description:
        "Search the company's policies/FAQ (things like leave policy, working hours, return policy, how-to-use-the-app questions) for an answer matching a topic or keyword. Use this whenever a worker or customer asks a 'how do I...' or policy/rules type question that isn't about a specific order.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Keyword or topic to search for, e.g. 'leave', 'return', 'working hours'" },
        },
        required: ["topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "prepare_order",
      description:
        "CUSTOMER ONLY. Use when a customer wants to place a new order. Collects the products (by name) and quantities they want, plus their delivery address, checks stock and prices, and returns a DRAFT summary for the customer to review — it does NOT create the order yet. Always show this draft to the customer and ask them to confirm before calling confirm_order.",
      parameters: {
        type: "object",
        properties: {
          products: {
            type: "array",
            description: "List of items the customer wants",
            items: {
              type: "object",
              properties: {
                productName: { type: "string" },
                quantity: { type: "number" },
              },
              required: ["productName", "quantity"],
            },
          },
          customerAddress: { type: "string", description: "Delivery address for this order" },
        },
        required: ["products", "customerAddress"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "confirm_order",
      description:
        "CUSTOMER ONLY. Call this ONLY after the customer has clearly confirmed (said yes/confirm/ok) to a draft order previously shown by prepare_order. This actually creates the real order in the system.",
      parameters: { type: "object", properties: {} },
    },
  },
];

async function executeTool(toolName, args, user) {
  // ---------------- get_order_status ----------------
  if (toolName === "get_order_status") {
    let query = { _id: args.orderId };
    if (user.role === "customer") query.customerPhone = user.phone;
    else if (user.role === "owner") query.company = user.company;
    else if (user.role === "manager") { query.company = user.company; query.assignedManager = user._id; }
    else if (user.role === "worker") query.assignedWorker = user._id;

    const order = await Order.findOne(query)
      .populate("products.product")
      .populate("assignedManager", "name")
      .populate("assignedWorker", "name");

    if (!order) return { found: false, message: "No matching order found, or you don't have access to it." };

    return {
      found: true,
      orderId: order._id,
      status: order.status,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      assignedManager: order.assignedManager?.name || null,
      assignedWorker: order.assignedWorker?.name || null,
      createdAt: order.createdAt,
      note: "Payment information is not tracked in this system — do not answer payment questions using this data.",
    };
  }

  // ---------------- list_my_orders ----------------
  if (toolName === "list_my_orders") {
    let query = {};
    if (user.role === "owner") query = { company: user.company };
    else if (user.role === "manager") query = { company: user.company, assignedManager: user._id };
    else if (user.role === "worker") query = { assignedWorker: user._id };
    else if (user.role === "customer") query = { customerPhone: user.phone };

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(10)
      .select("_id customerName status totalAmount createdAt");

    return {
      count: orders.length,
      orders: orders.map((o) => ({
        orderId: o._id, customerName: o.customerName, status: o.status,
        totalAmount: o.totalAmount, createdAt: o.createdAt,
      })),
    };
  }

  // ---------------- get_order_risk ----------------
  if (toolName === "get_order_risk") {
    if (!["owner", "manager"].includes(user.role)) {
      return { allowed: false, message: "Only owners and managers can check order risk." };
    }
    let query = { _id: args.orderId, company: user.company };
    if (user.role === "manager") query.assignedManager = user._id;

    const order = await Order.findOne(query);
    if (!order) return { found: false, message: "No matching order found, or you don't have access to it." };

    if (!order.deliveryDate) {
      return {
        found: true, riskAvailable: false,
        message: "This order doesn't have a delivery date set yet, so risk can't be calculated. Ask the Owner/Manager to set one.",
      };
    }

    const totalStages = order.checklist?.length || 0;
    const stagesRemaining = order.checklist?.filter((item) => item.status !== "Completed").length || 0;

    let assignedWorker = null;
    if (order.assignedWorker) {
      const activeTaskCount = await Order.countDocuments({
        assignedWorker: order.assignedWorker,
        status: { $nin: ["Delivered", "Cancelled"] },
      });
      assignedWorker = { id: order.assignedWorker, activeTaskCount };
    }

    const risk = computeRisk({
      deliveryDate: order.deliveryDate, stagesRemaining, totalStages: totalStages || 1, assignedWorker,
    });

    return { found: true, riskAvailable: true, ...risk };
  }

  // ---------------- check_worker_availability ----------------
  if (toolName === "check_worker_availability") {
    if (!["owner", "manager"].includes(user.role)) {
      return { allowed: false, message: "Only owners and managers can check worker availability." };
    }
    let query = { role: "worker", company: user.company };
    if (args.workerName) query.name = new RegExp(args.workerName, "i");

    const workers = await User.find(query).select("name isAvailable domains").populate("domains", "name").limit(15);

    return {
      count: workers.length,
      workers: workers.map((w) => ({
        name: w.name, status: w.isAvailable ? "Free" : "Busy", domains: (w.domains || []).map((d) => d.name),
      })),
    };
  }

  // ---------------- check_inventory_stock ----------------
  if (toolName === "check_inventory_stock") {
    if (!["owner", "manager"].includes(user.role)) {
      return { allowed: false, message: "Only owners and managers can check inventory stock." };
    }
    let query = { company: user.company };
    if (args.productName) query.productName = new RegExp(args.productName, "i");

    const products = await Inventory.find(query).select("productName quantity unit minimumStock").limit(15);

    return {
      count: products.length,
      products: products.map((p) => ({
        name: p.productName, quantity: p.quantity, unit: p.unit, lowStock: p.quantity <= p.minimumStock,
      })),
    };
  }

  // ---------------- get_company_info ----------------
  if (toolName === "get_company_info") {
    const company = await Company.findById(user.company);
    if (!company) return { found: false, message: "Company details not found." };

    const [workerCount, totalOrders, activeOrders] = await Promise.all([
      User.countDocuments({ company: user.company, role: "worker" }),
      Order.countDocuments({ company: user.company }),
      Order.countDocuments({ company: user.company, status: { $nin: ["Delivered", "Cancelled"] } }),
    ]);

    return {
      found: true,
      name: company.companyName,
      description: company.description || "Not set",
      address: company.address || "Not set",
      minimumOrderValue: company.minimumOrderValue,
      minimumOrderQuantity: company.minimumOrderQuantity,
      stats: { totalWorkers: workerCount, totalOrders, activeOrders },
    };
  }

  // ---------------- get_company_policy ----------------
  if (toolName === "get_company_policy") {
    const policies = await CompanyPolicy.find({
      company: user.company,
      topic: new RegExp(args.topic, "i"),
    }).limit(5);

    if (!policies.length) {
      return { found: false, message: "No policy found matching that topic. Suggest the user ask the Owner directly." };
    }

    return {
      found: true,
      policies: policies.map((p) => ({ topic: p.topic, answer: p.answer })),
    };
  }

  // ---------------- prepare_order ----------------
  if (toolName === "prepare_order") {
    if (user.role !== "customer") {
      return { allowed: false, message: "Only customers can place orders through the chatbot." };
    }
    if (!args.products || !args.products.length || !args.customerAddress) {
      return { error: "Missing products or delivery address." };
    }

    const items = [];
    let totalAmount = 0;
    const problems = [];

    for (const item of args.products) {
      const product = await Inventory.findOne({
        company: user.company,
        productName: new RegExp(item.productName, "i"),
      });

      if (!product) {
        problems.push(`"${item.productName}" not found in this company's products.`);
        continue;
      }
      if (product.quantity < item.quantity) {
        problems.push(`${product.productName} only has ${product.quantity} ${product.unit} in stock (you asked for ${item.quantity}).`);
        continue;
      }

      items.push({
        product: product._id,
        productName: product.productName,
        quantity: item.quantity,
        price: product.price,
      });
      totalAmount += product.price * item.quantity;
    }

    if (!items.length) {
      return { ready: false, problems, message: "None of the requested items could be added. Ask the customer to clarify." };
    }

    const draft = {
      customerName: user.name,
      customerPhone: user.phone,
      customerAddress: args.customerAddress,
      products: items,
      totalAmount,
    };

    saveDraft(user._id, draft);

    return {
      ready: true,
      draft: {
        items: items.map((i) => ({ name: i.productName, quantity: i.quantity, price: i.price })),
        totalAmount,
        deliveryAddress: args.customerAddress,
      },
      problems: problems.length ? problems : undefined,
      message: "Show this draft to the customer clearly and ask them to confirm (yes/confirm) before calling confirm_order.",
    };
  }

  // ---------------- confirm_order ----------------
  if (toolName === "confirm_order") {
    if (user.role !== "customer") {
      return { allowed: false, message: "Only customers can place orders through the chatbot." };
    }
    const draft = getDraft(user._id);
    if (!draft) {
      return { created: false, message: "No pending order draft found. Ask the customer what they'd like to order first." };
    }

    const order = await Order.create({
      company: user.company,
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
      customerAddress: draft.customerAddress,
      products: draft.products.map(({ product, quantity, price }) => ({ product, quantity, price })),
      totalAmount: draft.totalAmount,
    });

    clearDraft(user._id);

    return {
      created: true,
      orderId: order._id,
      totalAmount: order.totalAmount,
      message: "Order created successfully and sent to the company.",
    };
  }

  return { error: `Unknown tool: ${toolName}` };
}

async function handleChatQuery(message, user) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to your .env file.");
  }

  const systemPrompt = `You are VendorOS's in-app assistant, helping a logged-in ${user.role}.

You can look up real order, risk, worker, inventory, company, and policy data using the provided tools. Customers can also place new orders through you.

STRICT ANTI-HALLUCINATION RULES:
1. NEVER state a fact unless it came directly from a tool result in THIS conversation.
2. If no tool can answer the question, say plainly you don't have that information.
3. If a tool returns "found: false", an empty list, or "allowed: false", tell the user honestly.
4. Use conversation history only to resolve what "it/that" refers to, never to recall facts not in a tool result.
5. When in doubt, say you don't know rather than guessing.
6. ALWAYS reply in the SAME language and script as the user's latest message (Hindi/Hinglish/English — match exactly, including script).

ORDER PLACEMENT RULES (customers only):
7. When a customer wants to order something, call prepare_order first. NEVER call confirm_order in the same turn.
8. Always show the full draft (items, quantities, prices, total, address) clearly and explicitly ask "Shall I confirm this order?" before doing anything else.
9. Only call confirm_order after the customer has clearly said yes/confirm/ok in a later message.
10. If the customer changes their mind or wants to modify the order, call prepare_order again with the corrected items.

Keep answers short and conversational, not robotic.`;

  const history = getHistory(user._id);
  const messages = [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }];

  const firstResponse = await axios.post(
    GROQ_CHAT_URL,
    { model: CHAT_MODEL, messages, tools, tool_choice: "auto", temperature: 0.3 },
    { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" } }
  );

  const firstMessage = firstResponse.data.choices?.[0]?.message;
  const toolCalls = firstMessage?.tool_calls;

  if (!toolCalls || !toolCalls.length) {
    const reply = firstMessage?.content || "I'm not sure how to help with that.";
    appendToHistory(user._id, [{ role: "user", content: message }, { role: "assistant", content: reply }]);
    return reply;
  }

  messages.push(firstMessage);

  for (const call of toolCalls) {
    let args = {};
    try { args = JSON.parse(call.function.arguments || "{}"); } catch (e) { args = {}; }
    const result = await executeTool(call.function.name, args, user);
    messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
  }

  const secondResponse = await axios.post(
    GROQ_CHAT_URL,
    { model: CHAT_MODEL, messages, temperature: 0.3 },
    { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" } }
  );

  const finalReply = secondResponse.data.choices?.[0]?.message?.content ||
    "I found some data but couldn't summarize it — please try rephrasing.";

  appendToHistory(user._id, [{ role: "user", content: message }, { role: "assistant", content: finalReply }]);
  return finalReply;
}

module.exports = { handleChatQuery };