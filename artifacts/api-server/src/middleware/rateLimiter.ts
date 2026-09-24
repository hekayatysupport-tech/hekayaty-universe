import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Creates an Express rate-limiting middleware.
 * @param windowMs Time window in milliseconds
 * @param maxMax Maximum requests allowed within windowMs per IP
 * @param message Error response message when limit exceeded
 */
export const createRateLimiter = (windowMs: number, maxRequests: number, message: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Get client IP address
    const clientIp = (req.headers["x-forwarded-for"] as string || req.ip || "127.0.0.1").split(",")[0].trim();
    const routeKey = `${req.baseUrl}${req.path}:${clientIp}`;

    const now = Date.now();
    const record = rateLimitMap.get(routeKey);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(routeKey, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      res.status(429).json({
        error: "Too Many Requests",
        message,
        retryAfterSeconds,
      });
      return;
    }

    record.count += 1;
    next();
  };
};

/**
 * Strict rate limiter for Authentication endpoints (Login, Signup, Password Reset).
 * 10 requests per 15 minutes.
 */
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many authentication attempts. Please wait 15 minutes before trying again."
);

/**
 * Rate limiter for sensitive state-changing mutations (Admin, Publishing, Comments, Uploads).
 * 30 requests per minute.
 */
export const mutationRateLimiter = createRateLimiter(
  60 * 1000,
  30,
  "Too many actions. Please slow down your requests."
);

/**
 * Rate limiter for public read APIs (Search, Content Listings).
 * 150 requests per minute.
 */
export const publicReadRateLimiter = createRateLimiter(
  60 * 1000,
  150,
  "Rate limit exceeded for public requests. Please try again in a minute."
);
