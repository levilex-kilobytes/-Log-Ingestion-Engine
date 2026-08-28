import { describe, expect, it } from "vitest";
import { FallbackQueue } from "../../src/queue/fallbackQueue";
import type { EnrichedLog } from "../../src/types/log";

describe("FallbackQueue", () => {
  it("stores logs when a destination is unavailable", () => {
    const queue = new FallbackQueue();

    const log: EnrichedLog = {
      timestamp: "2026-08-26T10:00:00Z",
      service: "claims",
      level: "ERROR",
      message: "Database failed",
      received_at: "2026-08-26T10:00:00.123456Z",
      source_ip: "127.0.0.1",
      env: "test",
    };

    queue.push("claims-queue", log);

    expect(queue.size("claims-queue")).toBe(1);
  });

  it("pulls logs from the fallback queue", () => {
    const queue = new FallbackQueue();

    const log: EnrichedLog = {
      timestamp: "2026-08-26T10:00:00Z",
      service: "claims",
      level: "ERROR",
      message: "Database failed",
      received_at: "2026-08-26T10:00:00.123456Z",
      source_ip: "127.0.0.1",
      env: "test",
    };

    queue.push("claims-queue", log);

    const logs = queue.pull("claims-queue", 10);

    expect(logs).toHaveLength(1);
    expect(logs[0]).toEqual(log);
    expect(queue.size("claims-queue")).toBe(0);
  });
});
