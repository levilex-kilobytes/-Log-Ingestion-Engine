import { describe, expect, it, vi } from "vitest";
import { LogConsumer } from "../../src/queue/logConsumer";
import { RawLogChannel } from "../../src/queue/rawLogChannel";
import type { LogEntry } from "../../src/types/log";

const createLog = (id: number): LogEntry => ({
  timestamp: `2026-08-26T10:00:${String(id).padStart(2, "0")}Z`,
  service: "claims",
  level: "INFO",
  message: `Test log ${id}`,
});

describe("LogConsumer", () => {
  it("consumes logs in batches of 50", async () => {
    const channel = new RawLogChannel(100);

    for (let i = 1; i <= 50; i++) {
      await channel.push(createLog(i));
    }

    const handler = vi.fn().mockResolvedValue(undefined);

    const consumer = new LogConsumer(channel, handler);

    consumer.start();

    await vi.waitFor(() => {
      expect(handler).toHaveBeenCalled();
    });

    consumer.stop();

    expect(handler).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ service: "claims" })]),
    );

    expect(handler.mock.calls[0][0]).toHaveLength(50);
  });
});
