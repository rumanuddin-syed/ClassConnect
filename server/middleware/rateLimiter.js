// server/middleware/rateLimiter.js
const attempts = new Map();

/**
 * Basic in-memory rate limiter per IP / key.
 * @param {string} prefix 
 * @param {number} maxAttempts 
 * @param {number} windowMs 
 */
export const rateLimit = ({ prefix = "rl", maxAttempts = 5, windowMs = 15 * 60 * 1000 }) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "global";
    const key = `${prefix}:${ip}:${req.body.email || ""}`;
    const now = Date.now();

    const record = attempts.get(key);
    if (!record || now > record.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxAttempts) {
      const waitMinutes = Math.ceil((record.resetTime - now) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many attempts. Please try again after ${waitMinutes} minute(s).`,
      });
    }

    record.count += 1;
    next();
  };
};

