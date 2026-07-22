let model = null;

try {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
  model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
} catch (err1) {
  try {
    const { GoogleGenAI } = require("@google/genai");
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  } catch (err2) {
    console.warn("⚠️ Gemini AI package not initialized locally:", err1.message);
  }
}

module.exports = model;
