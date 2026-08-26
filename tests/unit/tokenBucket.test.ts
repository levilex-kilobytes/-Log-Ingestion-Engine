import { describe, expect, it, vi } from "vitest";
import { TokenBucket } from "../../src/rateLimiter/tokenBucket";

describe("TokenBucket", () => {
  it("allows requests when tokens are available", () => {
    const bucket = new TokenBucket({
      capacity: 3,
      refillRate: 3,
    });

    const result = bucket.check("192.168.1.1");

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("rejects requests when the bucket is empty", () => {
    const bucket = new TokenBucket({
      capacity: 2,
      refillRate: 1,
    });

    bucket.check("192.168.1.1");
    bucket.check("192.168.1.1");

    const result = bucket.check("192.168.1.1");

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("keeps separate buckets for different IP addresses", () => {
    const bucket = new TokenBucket({
      capacity: 1,
      refillRate: 1,
    });

    const firstIp = bucket.check("192.168.1.1");
    const secondIp = bucket.check("192.168.1.2");

    expect(firstIp.allowed).toBe(true);
    expect(secondIp.allowed).toBe(true);
  });

  it("refills tokens over time", () => {
    vi.useFakeTimers();

    const bucket = new TokenBucket({
      capacity: 2,
      refillRate: 1,
    });

    bucket.check("192.168.1.1");
    bucket.check("192.168.1.1");

    expect(bucket.check("192.168.1.1").allowed).toBe(false);

    vi.advanceTimersByTime(1000);

    expect(bucket.check("192.168.1.1").allowed).toBe(true);

    vi.useRealTimers();
  });

  it("does not exceed bucket capacity", () => {
    vi.useFakeTimers();

    const bucket = new TokenBucket({
      capacity: 2,
      refillRate: 100,
    });

    vi.advanceTimersByTime(10000);

    const first = bucket.check("192.168.1.1");
    const second = bucket.check("192.168.1.1");
    const third = bucket.check("192.168.1.1");

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);

    vi.useRealTimers();
  });
});
