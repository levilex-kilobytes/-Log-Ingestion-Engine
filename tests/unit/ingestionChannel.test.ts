import { describe, expect, it } from "vitest";
import { RawLogChannel } from "../../src/queue/rawLogChannel";

describe("RawLogChannel", () => {
  it("uses the configured buffer size", async () => {
    const channel = new RawLogChannel(2, 10);

    const log = {
      timestamp: "2026-08-26T10:00:00Z",
      service: "claims",
      level: "INFO" as const,
      message: "test",
    };

    expect(await channel.push(log)).toBe(true);
    expect(await channel.push(log)).toBe(true);

    expect(channel.size()).toBe(2);
  });

  it("rejects a log when the channel stays full", async () => {
    const channel = new RawLogChannel(1, 10);

    const log = {
      timestamp: "2026-08-26T10:00:00Z",
      service: "claims",
      level: "INFO" as const,
      message: "test",
    };

    expect(await channel.push(log)).toBe(true);

    const start = Date.now();
    const result = await channel.push(log);
    const elapsed = Date.now() - start;

    expect(result).toBe(false);
    expect(elapsed).toBeGreaterThanOrEqual(10);
  });
});
