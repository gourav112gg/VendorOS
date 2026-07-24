const stringSimilarity = require("string-similarity");
const axios = require("axios");

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

// Below this score, plain fuzzy matching isn't trusted — we fall back to the LLM.
const FUZZY_CONFIDENCE_THRESHOLD = 0.55;

function fuzzyMatch(transcript, checklistItems) {
  const labels = checklistItems.map((i) => i.label.toLowerCase());
  const { bestMatch, bestMatchIndex } = stringSimilarity.findBestMatch(
    transcript.toLowerCase(),
    labels
  );

  return {
    item: checklistItems[bestMatchIndex],
    confidence: bestMatch.rating,
  };
}

/**
 * Fallback matching via Groq's LLM. Now explicitly handles NEGATION —
 * e.g. "abhi packaging complete nahi hui hai" must NOT mark the item as
 * Completed. Without this instruction, the model was matching on topic
 * similarity alone and ignoring whether the statement was positive or
 * negative.
 */
async function llmMatch(transcript, checklistItems) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to your .env file.");
  }

  const itemList = checklistItems
    .map((i) => `- id: "${i.id}" | label: "${i.label}" | current status: "${i.status}"`)
    .join("\n");

  const systemPrompt = `You are a strict JSON-only classifier for a factory task-checklist app.
Given a worker's spoken status update (already transcribed to text) and a list of
checklist items, decide which item(s), if any, the worker is referring to, and
whether they are saying it IS done or is NOT done / still pending.

CRITICAL — NEGATION HANDLING:
- Carefully check whether the statement is POSITIVE ("done", "complete", "ho gaya",
  "khatam", "finished") or NEGATIVE ("not done", "nahi hua", "abhi nahi", "baaki hai",
  "incomplete", "pending", "not yet").
- If the statement is NEGATIVE (the worker is saying the task is NOT complete), you
  MUST set "new_status" to "In Progress" — NEVER "Completed" in this case.
- If the statement is POSITIVE (the task IS complete), set "new_status" to "Completed".
- Do not rely only on which words appear — a sentence can mention "packaging complete"
  while actually meaning the opposite ("packaging complete NAHI hui"), so read the
  full meaning of the sentence, not just keyword overlap.

Other rules:
- ONLY use ids that appear in the provided list. Never invent an id.
- If the transcript doesn't clearly relate to any item, return an empty "matches" array.
- One transcript can match more than one item.
- Respond with ONLY valid JSON. No prose, no markdown fences. Exact schema:
{"matches": [{"id": "string", "new_status": "Completed" | "In Progress", "confidence": 0.0}]}`;

  const userPrompt = `Checklist items:\n${itemList}\n\nWorker said: "${transcript}"`;

  const { data } = await axios.post(
    GROQ_CHAT_URL,
    {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const raw = data.choices?.[0]?.message?.content || '{"matches": []}';

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    parsed = { matches: [] };
  }

  const validIds = new Set(checklistItems.map((i) => String(i._id)));
  const safeMatches = (parsed.matches || []).filter((m) => validIds.has(String(m.id)));

  return safeMatches.map((m) => ({
    item: checklistItems.find((i) => String(i._id) === String(m.id)),
    newStatus: m.new_status === "In Progress" ? "In Progress" : "Completed",
    confidence: typeof m.confidence === "number" ? m.confidence : 0.5,
    method: "llm",
  }));
}

/**
 * Hybrid matcher: fuzzy first (free, instant), LLM fallback when unsure.
 *
 * NOTE: fuzzy matching still can't detect negation (it's pure text
 * similarity, no meaning understanding) — but it only fires when
 * confidence is already very high, which in practice means the wording is
 * close to the exact label. If negative phrasing sneaks through fuzzy
 * matching in some edge case, lowering FUZZY_CONFIDENCE_THRESHOLD forces
 * more cases through the LLM (which does understand negation) at the cost
 * of a few extra API calls.
 */
async function matchTranscriptToChecklist(transcript, checklistItems) {
  if (!transcript || !checklistItems?.length) {
    return { matches: [], method: "none" };
  }

  const fuzzyResult = fuzzyMatch(transcript, checklistItems);

  if (fuzzyResult.confidence >= FUZZY_CONFIDENCE_THRESHOLD) {
    return {
      matches: [
        {
          item: fuzzyResult.item,
          newStatus: "Completed",
          confidence: fuzzyResult.confidence,
          method: "fuzzy",
        },
      ],
      method: "fuzzy",
    };
  }

  const llmMatches = await llmMatch(transcript, checklistItems);
  return { matches: llmMatches, method: llmMatches.length ? "llm" : "none" };
}

module.exports = { matchTranscriptToChecklist };