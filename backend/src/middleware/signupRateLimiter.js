const RateLimit = require("../models/RateLimit");

/**
 * IP-based sign-up rate limiter.
 * Caps sign-up attempts to maxAttempts per IP per windowMs.
 * Default: 10 sign-up attempts per IP per hour.
 */
const createSignupRateLimiter = (maxAttempts = 10, windowMs = 60 * 60 * 1000) => {
  return async (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress || "unknown_ip";
    const key = `signup:${clientIp}`;
    const windowStart = new Date(Date.now() - windowMs);

    try {
      const record = await RateLimit.findOneAndUpdate(
        { key },
        {
          $inc: { attempts: 1 },
          $set: { lastAttempt: new Date() },
          $setOnInsert: { createdAt: new Date() }
        },
        { new: true, upsert: true }
      );

      // If record was recently reset or within window
      if (record.attempts > maxAttempts && record.lastAttempt > windowStart) {
        return res.status(429).json({
          success: false,
          message: "Invalid request"
        });
      }

      next();
    } catch (err) {
      console.error("[Signup Rate Limiter Error]", err);
      next(); // fail open — do not block on rate limit errors
    }
  };
};

module.exports = { createSignupRateLimiter };
