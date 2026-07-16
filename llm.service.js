const model = require("../config/gemini");
const createRiskPrompt = require("../prompts/risk.prompt");

const generateRiskExplanation = async (riskData) => {
  try {
    // Create Prompt
    const prompt = createRiskPrompt(riskData);

    // Send Prompt to Gemini
    const result = await model.generateContent(prompt);

    // Get Response Text
    const text = result.response.text();

    // Clean markdown if Gemini returns it
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Convert JSON string to object
    const parsedResponse = JSON.parse(cleanedText);

    return parsedResponse;

  } catch (error) {
    console.error("Gemini Error:", error.message);

    return {
      reason: riskData.reason,
      suggestedAction: riskData.suggestedAction,
    };
  }
};

module.exports = {
  generateRiskExplanation,
};