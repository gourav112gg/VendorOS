const ChatSession = require("../models/ChatSession");
const { encrypt, decrypt } = require("./encryption");

function isSameCalendarDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

/**
 * Finds the user's most recent session and returns it IF it was last active
 * today. Otherwise creates a fresh session — this is what gives the
 * "yesterday's chat closes, a new one starts today" behavior.
 */
async function getActiveSession(userId) {
  const latest = await ChatSession.findOne({ user: userId }).sort({ updatedAt: -1 });
  const now = new Date();

  if (latest && isSameCalendarDay(new Date(latest.updatedAt), now)) {
    return latest;
  }

  return ChatSession.create({ user: userId, messages: [] });
}

/**
 * Returns this user's current (today's) conversation as plain-text
 * { role, content } pairs — decrypted just for this request, never stored
 * decrypted anywhere.
 */
async function getHistory(userId) {
  const session = await getActiveSession(userId);

  return session.messages.map((m) => ({
    role: m.role,
    content: decrypt({
      encryptedContent: m.encryptedContent,
      iv: m.iv,
      authTag: m.authTag,
    }),
  }));
}

/**
 * Encrypts and appends new messages to today's active session. Also sets a
 * readable title from the first user message, if one hasn't been set yet.
 */
async function appendToHistory(userId, newMessages) {
  const session = await getActiveSession(userId);

  const encryptedMessages = newMessages.map((m) => ({
    role: m.role,
    ...encrypt(m.content),
    timestamp: new Date(),
  }));

  session.messages.push(...encryptedMessages);

  if (!session.title || session.title === "New conversation") {
    const firstUserMessage = newMessages.find((m) => m.role === "user");
    if (firstUserMessage) {
      session.title = firstUserMessage.content.slice(0, 60);
    }
  }

  await session.save();
}

/**
 * "Clear history" now means: start a brand-new session immediately (like
 * clicking "New Chat"), rather than deleting anything.
 */
async function clearHistory(userId) {
  await ChatSession.create({ user: userId, messages: [] });
}

module.exports = { getHistory, appendToHistory, clearHistory };
