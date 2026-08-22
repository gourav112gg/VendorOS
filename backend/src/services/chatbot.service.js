const axios = require("axios");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const Inventory = require("../models/Inventory");
const { computeRisk } = require("./risk.service");
const { getHistory, appendToHistory } = require("../utils/chatMemory");

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const CHAT_MODEL = "llama-3.3-70b-versatile";

// Helper to escape special regex characters and prevent ReDoS attacks
function escapeRegExp(string) {
  return typeof string === "string" ? string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
}

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
          workerName: {
            type: "string",
            description: "Optional partial name to search for a specific worker",
          },
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
          productName: {
            type: "string",
            description: "Optional partial product name to search for",
          },
        },
      },
    },
  },
];

async function executeTool(toolName, args, user) {
  if (toolName === "get_order_status") {
    if (!args.orderId || !mongoose.Types.ObjectId.isValid(args.orderId)) {
      return { found: false, message: "Invalid order ID format." };
    }

    let query = { _id: args.orderId };

    if (user.role === "customer") query.customerPhone = user.phone;
    else if (user.role === "owner") query.company = user.company;
    else if (user.role === "manager") {
      query.company = user.company;
      query.assignedManager = user._id;
    } else if (user.role === "worker") query.assignedWorker = user._id;

    const order = await Order.findOne(query)
      .populate("products.product")
      .populate("assignedManager", "name")
      .populate("assignedWorker", "name");

    if (!order) {
      return { found: false, message: "No matching order found, or you don't have access to it." };
    }

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

  if (toolName === "list_my_orders") {
    let query = {};

    if (user.role === "owner") query = { company: user.company };
    else if (user.role === "manager") query = { company: user.company, assignedManager: user._id };
    else if (user.role === "worker") query = { assignedWorker: user._id };
    else if (user.role === "customer") {
      if (!user.phone) {
        return { count: 0, orders: [], message: "No phone number linked to your customer account to look up orders." };
      }
      query = { customerPhone: user.phone };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id customerName status totalAmount createdAt");

    return {
      count: orders.length,
      orders: orders.map((o) => ({
        orderId: o._id,
        customerName: o.customerName,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt,
      })),
    };
  }

  if (toolName === "get_order_risk") {
    if (!["owner", "manager"].includes(user.role)) {
      return { allowed: false, message: "Only owners and managers can check order risk." };
    }

    if (!args.orderId || !mongoose.Types.ObjectId.isValid(args.orderId)) {
      return { found: false, message: "Invalid order ID format." };
    }

    let query = { _id: args.orderId, company: user.company };
    if (user.role === "manager") query.assignedManager = user._id;

    const order = await Order.findOne(query);
    if (!order) {
      return { found: false, message: "No matching order found, or you don't have access to it." };
    }

    if (!order.deliveryDate) {
      return {
        found: true,
        riskAvailable: false,
        message:
          "This order doesn't have a delivery date set yet, so risk can't be calculated. Ask the Owner/Manager to set one.",
      };
    }

    const totalStages = order.checklist?.length || 0;
    const stagesRemaining =
      order.checklist?.filter((item) => item.status !== "Completed").length || 0;

    let assignedWorker = null;
    if (order.assignedWorker) {
      const activeTaskCount = await Order.countDocuments({
        assignedWorker: order.assignedWorker,
        status: { $nin: ["Delivered", "Cancelled"] },
      });
      assignedWorker = { id: order.assignedWorker, activeTaskCount };
    }

    const risk = computeRisk({
      deliveryDate: order.deliveryDate,
      stagesRemaining,
      totalStages: totalStages || 1,
      assignedWorker,
    });

    return { found: true, riskAvailable: true, ...risk };
  }

  if (toolName === "check_worker_availability") {
    if (!["owner", "manager"].includes(user.role)) {
      return { allowed: false, message: "Only owners and managers can check worker availability." };
    }

    let query = { role: "worker", company: user.company };
    if (args.workerName && typeof args.workerName === "string") {
      query.name = new RegExp(escapeRegExp(args.workerName.trim()), "i");
    }

    const workers = await User.find(query)
      .select("name isAvailable domains")
      .populate("domains", "name")
      .limit(15);

    return {
      count: workers.length,
      workers: workers.map((w) => ({
        name: w.name,
        status: w.isAvailable ? "Free" : "Busy",
        domains: (w.domains || []).map((d) => d.name),
      })),
    };
  }

  if (toolName === "check_inventory_stock") {
    if (!["owner", "manager"].includes(user.role)) {
      return { allowed: false, message: "Only owners and managers can check inventory stock." };
    }

    let query = { company: user.company };
    if (args.productName && typeof args.productName === "string") {
      query.productName = new RegExp(escapeRegExp(args.productName.trim()), "i");
    }

    const products = await Inventory.find(query)
      .select("productName quantity unit minimumStock")
      .limit(15);

    return {
      count: products.length,
      products: products.map((p) => ({
        name: p.productName,
        quantity: p.quantity,
        unit: p.unit,
        lowStock: p.quantity <= p.minimumStock,
      })),
    };
  }

  return { error: `Unknown tool: ${toolName}` };
}

async function handleChatQuery(message, user) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to your .env file.");
  }

  const systemPrompt = `You are VendorOS's friendly in-app assistant, helping a logged-in ${user.role}.

LANGUAGE — FOLLOW THIS STRICTLY:
- Always reply in the SAME language/style the user just wrote in (e.g. if they wrote
  in Hinglish, reply in Hinglish; if English, reply in English; if Hindi, reply in Hindi).
- This applies even when the underlying data (order status, tool results, etc.) is in
  English — translate/phrase your answer in the user's language, don't switch to
  English just because the data happens to be in English.
- Match their language on every single reply, not just the first one.

GREETINGS & SMALL TALK:
- If the user just says something like "hi", "hello", "hey", "how are you", "thanks",
  "good morning", or other casual small talk, respond warmly and naturally in a short
  sentence or two — do NOT call any tool for this, and do NOT treat it as a data
  question. A simple friendly reply is enough (e.g. "Hey! I can help you check your
  orders, risk scores, worker availability, or stock — what do you need?").

DATA QUESTIONS:
You can look up real order, risk, worker, and inventory data using the provided tools.

STRICT ANTI-HALLUCINATION RULES — follow these exactly:
1. NEVER state a fact (a status, a name, an amount, a date, a payment detail, anything)
   unless it came directly from a tool result in THIS conversation. Not from your own
   training knowledge, not from a guess, not from "typical" values.
2. If the user asks about something no available tool can answer (e.g. payment status,
   shipping carrier, anything not returned by a tool), say plainly: "I don't have that
   information — there's no tool available for it," instead of guessing or inventing
   a plausible-sounding answer.
3. If a tool returns "found: false", an empty list, or "allowed: false", tell the user
   honestly and suggest what they could check instead.
4. Use the conversation history only to resolve WHICH thing the user means (e.g. "its
   status" referring to an order mentioned earlier) — never to recall facts not
   actually present in a tool result.
5. When in doubt about whether you actually know something or are guessing, treat it
   as guessing and say you don't have that information.

Keep answers short and conversational, not robotic.`;

  const history = await getHistory(user._id);

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  const firstResponse = await axios.post(
    GROQ_CHAT_URL,
    { model: CHAT_MODEL, messages, tools, tool_choice: "auto", temperature: 0.4 },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const firstMessage = firstResponse.data.choices?.[0]?.message;
  const toolCalls = firstMessage?.tool_calls;

  if (!toolCalls || !toolCalls.length) {
    const reply = firstMessage?.content || "Hey! How can I help you today?";
    await appendToHistory(user._id, [
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ]);
    return reply;
  }

  messages.push(firstMessage);

  for (const call of toolCalls) {
    let args = {};
    try {
      args = JSON.parse(call.function.arguments || "{}");
    } catch (e) {
      args = {};
    }

    const result = await executeTool(call.function.name, args, user);

    messages.push({
      role: "tool",
      tool_call_id: call.id,
      content: JSON.stringify(result),
    });
  }

  const secondResponse = await axios.post(
    GROQ_CHAT_URL,
    { model: CHAT_MODEL, messages, temperature: 0.3 },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const finalReply =
    secondResponse.data.choices?.[0]?.message?.content ||
    "I found some data but couldn't summarize it — please try rephrasing.";

  await appendToHistory(user._id, [
    { role: "user", content: message },
    { role: "assistant", content: finalReply },
  ]);

  return finalReply;
}

module.exports = { handleChatQuery };
