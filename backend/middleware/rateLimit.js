import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per IP
});

// not used
export const ocrLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20, // per hour
});
