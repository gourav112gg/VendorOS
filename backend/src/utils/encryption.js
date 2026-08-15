const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

/**
 * Derives a proper 32-byte encryption key from your .env secret.
 * CHAT_ENCRYPTION_KEY can be any long random string — this stretches it
 * to the exact key length AES-256 needs.
 */
function getKey() {
  const secret = process.env.CHAT_ENCRYPTION_KEY || "vendoros_default_dev_chat_encryption_secret_salt_2026";
  if (!process.env.CHAT_ENCRYPTION_KEY && process.env.NODE_ENV === "production") {
    console.warn("[Security Alert] CHAT_ENCRYPTION_KEY is missing in production. Using fallback secret.");
  }
  return crypto.scryptSync(secret, "vendoros-chat-salt", 32);
}

/**
 * Encrypts a plain text string. Returns everything needed to decrypt it later
 * (the encrypted blob, the IV, and the auth tag) — all safe to store in MongoDB.
 */
function encrypt(plainText) {
  const iv = crypto.randomBytes(12); // recommended IV length for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encryptedContent: encrypted,
    iv: iv.toString("hex"),
    authTag,
  };
}

/**
 * Decrypts back to the original plain text. Throws if the auth tag doesn't
 * match — which also protects against the stored data being tampered with.
 */
function decrypt({ encryptedContent, iv, authTag }) {
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encryptedContent, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err.message);
    return "[Encrypted message content unavailable]";
  }
}

module.exports = { encrypt, decrypt };
