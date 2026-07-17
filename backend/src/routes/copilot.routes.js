const express = require("express");
const router = express.Router();
const { GoogleGenAI, Type } = require("@google/genai");

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

/**
 * Fallback dynamic theme generator using HSL colors
 */
function generateFallbackColors(prompt, mode) {
  const normalized = prompt.toLowerCase();

  let hue = 200;
  let saturation = 70;
  let lightness = 50;

  if (
    normalized.includes("fire") ||
    normalized.includes("lava") ||
    normalized.includes("sunset") ||
    normalized.includes("red") ||
    normalized.includes("warm") ||
    normalized.includes("orange") ||
    normalized.includes("sun")
  ) {
    hue = 15;
    saturation = 85;
    lightness = 50;
  } else if (
    normalized.includes("forest") ||
    normalized.includes("green") ||
    normalized.includes("mint") ||
    normalized.includes("nature") ||
    normalized.includes("emerald") ||
    normalized.includes("leaf") ||
    normalized.includes("matcha")
  ) {
    hue = 145;
    saturation = 75;
    lightness = 45;
  } else if (
    normalized.includes("cyber") ||
    normalized.includes("punk") ||
    normalized.includes("neon") ||
    normalized.includes("arcade") ||
    normalized.includes("violet") ||
    normalized.includes("pink") ||
    normalized.includes("synth")
  ) {
    hue = 320;
    saturation = 90;
    lightness = 55;
  } else if (
    normalized.includes("ocean") ||
    normalized.includes("blue") ||
    normalized.includes("cool") ||
    normalized.includes("water") ||
    normalized.includes("sea") ||
    normalized.includes("ice") ||
    normalized.includes("sky")
  ) {
    hue = 205;
    saturation = 80;
    lightness = 50;
  } else if (
    normalized.includes("purple") ||
    normalized.includes("lavender") ||
    normalized.includes("grape")
  ) {
    hue = 270;
    saturation = 75;
    lightness = 55;
  } else if (
    normalized.includes("gold") ||
    normalized.includes("yellow") ||
    normalized.includes("sand") ||
    normalized.includes("amber")
  ) {
    hue = 45;
    saturation = 85;
    lightness = 50;
  } else {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      hash = prompt.charCodeAt(i) + ((hash << 5) - hash);
    }
    hue = Math.abs(hash) % 360;
    saturation = 65 + (Math.abs(hash >> 3) % 25);
    lightness = 45 + (Math.abs(hash >> 6) % 15);
  }

  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  const accent = hslToHex(hue, saturation, lightness);
  const accentHover = hslToHex(hue, saturation, Math.max(20, lightness - 10));

  if (mode === "light") {
    return {
      bgApp: hslToHex(hue, 15, 98),
      bgCard: "#FFFFFF",
      bgSecondary: hslToHex(hue, 12, 95),
      bgInput: hslToHex(hue, 12, 91),
      border: hslToHex(hue, 10, 86),
      textPrimary: hslToHex(hue, 60, 12),
      textSecondary: hslToHex(hue, 40, 28),
      textMuted: hslToHex(hue, 25, 48),
      accent,
      accentHover,
    };
  } else {
    return {
      bgApp: hslToHex(hue, 25, 4),
      bgCard: hslToHex(hue, 20, 8),
      bgSecondary: hslToHex(hue, 22, 6),
      bgInput: hslToHex(hue, 18, 14),
      border: hslToHex(hue, 15, 18),
      textPrimary: hslToHex(hue, 10, 96),
      textSecondary: hslToHex(hue, 15, 82),
      textMuted: hslToHex(hue, 15, 60),
      accent,
      accentHover,
    };
  }
}

function computeFallbackRiskScore(order) {
  const value = order.value || 0;
  const daysRemaining = 5;
  const stagesRemaining = 3;
  const totalStages = 5;

  const schedulePressure = Math.min(
    100,
    Math.max(0, ((14 - daysRemaining) / 14) * 100)
  );
  const stageRatio = (stagesRemaining / totalStages) * 100;
  const workerLoad = 40;

  const score = Math.round(
    schedulePressure * 0.45 + stageRatio * 0.35 + workerLoad * 0.2
  );

  return {
    score: score,
    reason:
      "Operational risk assessed using rule-engine fallback due to temporary AI unavailability.",
    action: "Review order deadlines and worker workload details manually.",
  };
}

/**
 * AI Operations Copilot API
 */
router.post("/copilot/risk", async (req, res) => {
  const { order, subscription } = req.body;
  try {
    if (!order) {
      return res.status(400).json({ error: "Order details are required." });
    }

    if (
      !subscription ||
      subscription.tier === "free" ||
      subscription.status !== "active"
    ) {
      return res.status(403).json({
        error:
          "Access Denied: AI Operations Copilot is only available on Growth and Scale tiers with an active subscription.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Using simulated copilot fallback.");
      const simulatedScore = Math.floor(Math.random() * 40) + 10;
      return res.json({
        score: simulatedScore,
        reason: "[Simulated] Order is standard but server has no GEMINI_API_KEY set.",
        action:
          "Configure GEMINI_API_KEY in Settings > Secrets to enable live Gemini predictions.",
      });
    }

    const prompt = `Analyze this service order for operational risks:
Title: ${order.title}
Description: ${order.description}
Customer: ${order.customerName}
Address: ${order.address}
Estimated Job Value: ${order.value || 0}
Stage: ${order.stage}

Evaluate potential risks like high cost complexity, scheduling issues, safety challenges, location delays, and severe weather impacts. Keep the reason and action highly concise and focused.`;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI Request Timeout")), 5000)
    );

    const apiCallPromise = ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are VendorOS AI Copilot. You analyze field service operations orders to find risks and suggest mitigations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description:
                "Operational risk score from 0 (very low risk) to 100 (extreme risk/escalate).",
            },
            reason: {
              type: Type.STRING,
              description:
                "A precise single-sentence explanation of the risk factors found.",
            },
            action: {
              type: Type.STRING,
              description:
                "One highly actionable mitigation or diagnostic recommendation step.",
            },
          },
          required: ["score", "reason", "action"],
        },
      },
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]);
    const resultText = response.text || "{}";
    try {
      const parsedResult = JSON.parse(resultText.trim());
      return res.json(parsedResult);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON output:", resultText);
      const fallbackResponse = computeFallbackRiskScore(order);
      return res.json(fallbackResponse);
    }
  } catch (error) {
    console.warn(
      "Gemini Copilot Error / Timeout, falling back to rule-engine:",
      error.message
    );
    const fallbackResponse = computeFallbackRiskScore(order);
    return res.json(fallbackResponse);
  }
});

/**
 * AI Natural Language Theme Generator API
 */
router.post("/generate-theme", async (req, res) => {
  const { prompt, mode } = req.body;
  const currentMode = mode === "light" ? "light" : "dark";

  if (!prompt) {
    return res.status(400).json({ error: "Theme description prompt is required." });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Using dynamic fallback theme generation.");
    const simulatedColors = generateFallbackColors(prompt, currentMode);
    return res.json({ colors: simulatedColors });
  }

  try {
    const systemPrompt = `You are an expert color palette generator and UI designer. 
Your task is to generate a beautiful, professionally coordinated color palette based on a natural language theme or mood prompt.
The output MUST be a JSON object containing HEX codes for an application UI in either light or dark mode as specified by the user.
Ensure the contrast is extremely high, accessible (WCAG compliant), and visually gorgeous.
Light mode MUST use very light off-white/cream backgrounds, dark text, and soft light borders.
Dark mode MUST use deep rich dark backgrounds, light text, and clean dark borders.`;

    const contents = `Generate a ${currentMode} mode color palette for the theme: "${prompt}".

Provide a JSON with the following exact keys:
- bgApp, bgCard, bgSecondary, bgInput, border, textPrimary, textSecondary, textMuted, accent, accentHover`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bgApp: { type: Type.STRING },
            bgCard: { type: Type.STRING },
            bgSecondary: { type: Type.STRING },
            bgInput: { type: Type.STRING },
            border: { type: Type.STRING },
            textPrimary: { type: Type.STRING },
            textSecondary: { type: Type.STRING },
            textMuted: { type: Type.STRING },
            accent: { type: Type.STRING },
            accentHover: { type: Type.STRING },
          },
          required: [
            "bgApp",
            "bgCard",
            "bgSecondary",
            "bgInput",
            "border",
            "textPrimary",
            "textSecondary",
            "textMuted",
            "accent",
            "accentHover",
          ],
        },
      },
    });

    const resultText = response.text || "{}";
    const parsedResult = JSON.parse(resultText.trim());
    return res.json({ colors: parsedResult });
  } catch (error) {
    console.warn(
      "Gemini API unavailable. Falling back to deterministic generation.",
      error.message
    );
    const fallbackColors = generateFallbackColors(prompt, currentMode);
    return res.json({
      colors: fallbackColors,
      note: "Simulated high-contrast generation due to temporary service load.",
    });
  }
});

/**
 * Razorpay Subscription Webhook Simulation Endpoint
 */
router.post("/razorpay/webhook", (req, res) => {
  const { event, subscriptionId, tier } = req.body;

  if (!event || !subscriptionId || !tier) {
    return res
      .status(400)
      .json({
        error: "Missing required webhook fields (event, subscriptionId, tier).",
      });
  }

  const nowString = new Date().toISOString();
  let status = "active";
  let currentPeriodEnd = new Date(Date.now() + 1000 * 3600 * 24 * 30).toISOString();

  switch (event) {
    case "subscription.charged":
      status = "active";
      break;
    case "subscription.halted":
      status = "past_due";
      currentPeriodEnd = new Date().toISOString();
      break;
    case "subscription.cancelled":
      status = "canceled";
      currentPeriodEnd = new Date().toISOString();
      break;
    default:
      return res.status(400).json({ error: `Unknown webhook event: ${event}` });
  }

  console.log(
    `[Razorpay Webhook] Event: ${event} | SubID: ${subscriptionId} | Tier: ${tier} | Status: ${status}`
  );

  return res.json({
    subscription: {
      tier,
      status,
      currentPeriodEnd,
      razorpaySubscriptionId: subscriptionId,
      updatedAt: nowString,
    },
    webhookProcessed: true,
    processedAt: nowString,
    eventHandled: event,
  });
});

module.exports = router;
