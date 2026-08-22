const rateLimitCache = new Map();

// Periodic sweeper to purge stale keys every 5 minutes and prevent memory leaks
const sweepInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitCache.entries()) {
    // If all timestamps are older than 15 minutes, remove key entirely
    const hasRecent = timestamps.some(t => now - t < 15 * 60 * 1000);
    if (!hasRecent) {
      rateLimitCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

if (sweepInterval.unref) {
  sweepInterval.unref(); // Allow Node process to exit gracefully without holding event loop open
}

const rateLimiter = (options = { windowMs: 60000, max: 5, message: "Too many requests. Please try again later." }) => {
  return (req, res, next) => {
    const key = (req.user ? req.user._id.toString() : req.ip) || "unknown_client";
    const now = Date.now();

    if (!rateLimitCache.has(key)) {
      rateLimitCache.set(key, []);
    }

    const timestamps = rateLimitCache.get(key);
    // Filter timestamps within window
    const validTimestamps = timestamps.filter(t => now - t < options.windowMs);
    
    if (validTimestamps.length >= options.max) {
      return res.status(429).json({
        success: false,
        message: options.message,
      });
    }

    validTimestamps.push(now);
    rateLimitCache.set(key, validTimestamps);
    next();
  };
};

module.exports = rateLimiter;
