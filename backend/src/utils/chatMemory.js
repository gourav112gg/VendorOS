/**
 * Simple in-memory conversation memory, keyed by user ID.
 *
 * NOTE: this resets whenever the server restarts (nodemon reload, deploy, etc.)
 * — that's an intentional tradeoff for Week-1/demo scope. If you need memory
 * that survives restarts, this same interface (getHistory/appendToHistory/
 * clearHistory) can be swapped to read/write a MongoDB collection instead,
 * without changing any of the chatbot code that calls it.
 */

const conversations = new Map(); // userId (string) -> [{ role, content }, ...]

const MAX_MESSAGES_PER_USER = 20; // keep last 20 turns so prompts don't grow unbounded

function getHistory(userId) {
  return conversations.get(String(userId)) || [];
}

function appendToHistory(userId, newMessages) {
  const key = String(userId);
  const existing = conversations.get(key) || [];
  const updated = [...existing, ...newMessages].slice(-MAX_MESSAGES_PER_USER);
  conversations.set(key, updated);
}

function clearHistory(userId) {
  conversations.delete(String(userId));
}

module.exports = { getHistory, appendToHistory, clearHistory };
