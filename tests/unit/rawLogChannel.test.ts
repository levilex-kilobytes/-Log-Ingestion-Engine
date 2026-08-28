import { describe, expect, it } from "vitest";
import { RawLogChannel } from "../../src/queue/rawLogChannel";
import type { LogEntry } from "../../src/types/log";

const createLog = (id: number): LogEntry => ({
  timestamp: `2026-08-26T10:00:${String(id).padStart(2, "0")}Z`,
  service: "claims",
  level: "INFO",
  message: `Test log ${id}`,
});

describe("RawLogChannel", () => {
  it("pushes and stores logs", async () => {
    const channel = new RawLogChannel(10);

    const result = await channel.push(createLog(1));

    expect(result).toBe(true);
    expect(channel.size()).toBe(1);
  });

  it("pulls logs in batches", async () => {
    const channel = new RawLogChannel(100);

    for (let i = 1; i <= 60; i++) {
      await channel.push(createLog(i));
    }

    const batch = channel.pullBatch(50);

    expect(batch).toHaveLength(50);
    expect(channel.size()).toBe(10);
  });

  it("returns all remaining logs when fewer than batch size exist", async () => {
    const channel = new RawLogChannel(100);

    for (let i = 1; i <= 5; i++) {
      await channel.push(createLog(i));
    }

    const batch = channel.pullBatch(50);

    expect(batch).toHaveLength(5);
    expect(channel.size()).toBe(0);
  });

  it("rejects a log when the channel remains full after the timeout", async () => {
    const channel = new RawLogChannel(1, 100);

    await channel.push(createLog(1));

    const start = Date.now();
    const result = await channel.push(createLog(2));
    const elapsed = Date.now() - start;

    expect(result).toBe(false);
    expect(channel.size()).toBe(1);
    expect(elapsed).toBeGreaterThanOrEqual(100);
  });
});
