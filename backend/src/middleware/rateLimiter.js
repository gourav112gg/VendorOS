const rateLimitCache = new Map();

const rateLimiter = (options = { windowMs: 60000, max: 5, message: "Too many requests. Please try again later." }) => {
  return (req, res, next) => {
    const key = req.user ? req.user._id.toString() : req.ip;
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
