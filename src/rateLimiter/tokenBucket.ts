export interface TokenBucketOptions {
  capacity: number;
  refillRate: number;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
}

export class TokenBucket {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly options: TokenBucketOptions) {}

  check(key: string): {
    allowed: boolean;
    remaining: number;
    retryAfter: number;
  } {
    const now = Date.now();

    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = {
        tokens: this.options.capacity,
        lastRefill: now,
      };

      this.buckets.set(key, bucket);
    }

    const elapsedSeconds = (now - bucket.lastRefill) / 1000;

    const tokensToAdd = elapsedSeconds * this.options.refillRate;

    bucket.tokens = Math.min(
      this.options.capacity,
      bucket.tokens + tokensToAdd,
    );

    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;

      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        retryAfter: 0,
      };
    }

    const retryAfter = Math.ceil((1 - bucket.tokens) / this.options.refillRate);

    return {
      allowed: false,
      remaining: 0,
      retryAfter,
    };
  }
}
