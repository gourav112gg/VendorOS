const createRiskPrompt = ({
  riskPercentage,
  deliveryDate,
  stagesRemaining,
  totalStages,
  assignedWorker,
}) => {
  return `
You are VendorOS AI Assistant.

Your task is to explain the project risk prediction in a professional and concise way.

Project Details:

- Risk Score: ${riskPercentage}%
- Delivery Date: ${deliveryDate}
- Remaining Stages: ${stagesRemaining}
- Total Stages: ${totalStages}
- Assigned Worker Load: ${assignedWorker?.activeTaskCount || 0} active tasks

Instructions:

1. Explain why this risk score occurred.
2. Give only one practical suggestion.
3. Keep the explanation short (maximum 2 sentences).
4. Do not use markdown.
5. Do not use bullet points.
6. Return ONLY valid JSON.
7. Return only the JSON object without any extra text or formatting.
8. Do not invent facts. Base your explanation only on the provided project data.

Response Format:

{
  "reason": "...",
  "suggestedAction": "..."
}
`;
};

module.exports = createRiskPrompt;
