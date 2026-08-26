import express from "express";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { TokenBucket } from "../../src/rateLimiter/tokenBucket";

describe("Rate limiter", () => {
  it("returns 429 when the rate limit is exceeded", async () => {
    const app = express();

    const bucket = new TokenBucket({
      capacity: 2,
      refillRate: 2,
    });

    app.use(express.json());

    app.use((req, res, next) => {
      const key = req.ip ?? "unknown";
      const result = bucket.check(key);

      res.setHeader("X-RateLimit-Remaining", result.remaining.toString());

      if (!result.allowed) {
        res.setHeader("Retry-After", result.retryAfter.toString());

        res.status(429).json({
          error: "Too many requests",
        });

        return;
      }

      next();
    });

    app.post("/logs", (req, res) => {
      res.status(202).json({
        status: "accepted",
      });
    });

    await request(app).post("/logs").send([]);

    await request(app).post("/logs").send([]);

    const response = await request(app).post("/logs").send([]);

    expect(response.status).toBe(429);
    expect(response.headers["retry-after"]).toBeDefined();
    expect(response.body.error).toBe("Too many requests");
  });
});
