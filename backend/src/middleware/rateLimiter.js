import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: isProduction ? 15 * 60 * 1000 : 60 * 1000, // 15 min in prod, 1 min in dev
  max: isProduction ? 500 : 1000, // Increased from 100 to 500 in production (prevents 429 blocking legitimate users)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: isProduction
      ? "Too many requests from this IP, please try again after 15 minutes"
      : "Too many requests from this IP, please slow down and try again shortly",
  },
});

// Strict limiter for auth routes (login, register)
export const authLimiter = rateLimit({
  windowMs: isProduction ? 15 * 60 * 1000 : 10 * 60 * 1000, // 15 min in prod, 10 min in dev
  max: isProduction ? 10 : 100, // Keep strict in prod, generous in dev
  standardHeaders: true,
  legacyHeaders: false,
  // Count only failed auth responses, so successful login/register doesn't consume quota
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: isProduction
      ? "Too many login/register attempts, please try again after 15 minutes"
      : "Too many failed auth attempts, please wait a few minutes and try again",
  },
});

// Chat message sending limiter
export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages sent, please slow down",
  },
});
