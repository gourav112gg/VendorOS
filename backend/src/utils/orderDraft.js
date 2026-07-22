// Simple in-memory store for "pending" customer orders awaiting confirmation.
// Same pattern as chatMemory.js — resets if server restarts (fine for MVP).

const drafts = new Map();

function saveDraft(userId, draft) {
  drafts.set(String(userId), draft);
}

function getDraft(userId) {
  return drafts.get(String(userId)) || null;
}

function clearDraft(userId) {
  drafts.delete(String(userId));
}

module.exports = { saveDraft, getDraft, clearDraft };