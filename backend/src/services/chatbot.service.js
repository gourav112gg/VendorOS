const axios = require("axios");
const Order = require("../models/Order");
const User = require("../models/User");

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const CHAT_MODEL = "llama-3.3-70b-versatile"; // stronger reasoning, needed for reliable tool selection

// ---------------------------------------------------------------------------
// TOOL DEFINITIONS — these are the only "actions" the chatbot is allowed to take.
// The LLM never touches the database directly; it only picks a tool + arguments,
// and OUR code (below) does the actual, role-scoped Mongo query.
// ---------------------------------------------------------------------------
const tools = [
  {
    type: "function",
    function: {
      name: "get_order_status",
      description:
        "Get the status, delivery info, and details of ONE specific order by its order ID.",
      parameters: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
            description: "The MongoDB _id of the order",
          },
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
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

/**
 * Executes a tool call against MongoDB, always scoped to the requesting user's
 * role/company so nobody can query data outside their own visibility (matches
 * the same scoping rules already used in order.controller.js).
 */
async function executeTool(toolName, args, user) {
  if (toolName === "get_order_status") {
    let query = { _id: args.orderId };

    if (user.role === "customer") {
      query.customerPhone = user.phone;
    } else if (user.role === "owner") {
      query.company = user.company;
    } else if (user.role === "manager") {
      query.company = user.company;
      query.assignedManager = user._id;
    } else if (user.role === "worker") {
      query.assignedWorker = user._id;
    }

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
    };
  }

  if (toolName === "list_my_orders") {
    let query = {};

    if (user.role === "owner") {
      query = { company: user.company };
    } else if (user.role === "manager") {
      query = { company: user.company, assignedManager: user._id };
    } else if (user.role === "worker") {
      query = { assignedWorker: user._id };
    } else if (user.role === "customer") {
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

  return { error: `Unknown tool: ${toolName}` };
}

/**
 * Main entry point: takes the user's free-text message + their auth'd user object,
 * lets the LLM decide whether/which tool to call, executes it against real data,
 * then asks the LLM to phrase a natural-language answer using that real data.
 *
 * @param {string} message - what the user typed
 * @param {object} user - req.user (must have _id, role, company, phone)
 * @returns {Promise<string>} final natural-language answer
 */
async function handleChatQuery(message, user) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to your .env file.");
  }

  const systemPrompt = `You are VendorOS's in-app assistant, helping a logged-in ${user.role}.
You can look up real order data using the provided tools — never guess or invent order
details, statuses, or names. If a tool returns "found: false" or an empty list, tell the
user honestly that nothing was found, and suggest what they could check instead (e.g.
double-checking the order ID). Keep answers short and conversational, not robotic.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: message },
  ];

  // --- First call: let the model decide if/which tool to use ---
  const firstResponse = await axios.post(
    GROQ_CHAT_URL,
    {
      model: CHAT_MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const firstMessage = firstResponse.data.choices?.[0]?.message;
  const toolCalls = firstMessage?.tool_calls;

  // No tool needed (e.g. user just said "hi") — return the direct reply.
  if (!toolCalls || !toolCalls.length) {
    return firstMessage?.content || "I'm not sure how to help with that.";
  }

  // --- Execute each requested tool against real MongoDB data ---
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

  // --- Second call: let the model phrase the final answer using real results ---
  const secondResponse = await axios.post(
    GROQ_CHAT_URL,
    {
      model: CHAT_MODEL,
      messages,
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return (
    secondResponse.data.choices?.[0]?.message?.content ||
    "I found some data but couldn't summarize it — please try rephrasing."
  );
}

module.exports = { handleChatQuery };
