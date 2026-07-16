const axios = require("axios");
const FormData = require("form-data");

const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

async function transcribeAudio(audioBuffer, filename = "update.webm") {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to your .env file.");
  }

  const form = new FormData();
  form.append("file", audioBuffer, filename);
  form.append("model", "whisper-large-v3-turbo");
  form.append("response_format", "json");

  const { data } = await axios.post(GROQ_TRANSCRIBE_URL, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return (data.text || "").trim();
}

module.exports = { transcribeAudio };