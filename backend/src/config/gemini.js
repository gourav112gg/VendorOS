let model = null;

try {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
} catch (err) {
  console.warn("⚠️ Gemini AI package not initialized:", err.message);
}

module.exports = model;

