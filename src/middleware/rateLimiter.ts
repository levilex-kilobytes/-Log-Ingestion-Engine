import { Request, Response, NextFunction } from "express";
import { TokenBucket } from "../rateLimiter/tokenBucket";

const rateLimit = Number(process.env.RATE_LIMIT);

const tokenBucket = new TokenBucket({
  capacity: rateLimit,
  refillRate: rateLimit,
});

export function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const key = req.ip ?? "unknown";

  const result = tokenBucket.check(key);

  res.setHeader("X-RateLimit-Remaining", result.remaining.toString());

  if (!result.allowed) {
    res.setHeader("Retry-After", result.retryAfter.toString());

    res.status(429).json({
      error: "Too many requests",
    });

    return;
  }

  next();
}
