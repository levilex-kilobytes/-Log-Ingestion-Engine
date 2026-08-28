import { describe, expect, it, vi } from "vitest";
import type { EnrichedLog } from "../../src/types/log";
import { RetryWriter } from "../../src/storage/retry";

const log: EnrichedLog = {
  timestamp: "2026-08-26T10:00:00Z",
  service: "service1",
  level: "ERROR",
  message: "Database failed",
  received_at: "2026-08-26T10:00:00.123456Z",
  source_ip: "127.0.0.1",
  env: "production",
};

describe("RetryWriter", () => {
  it("writes successfully without retrying when the first attempt succeeds", async () => {
    const writer = {
      insert: vi.fn(),
    };

    const deadLetter = {
      write: vi.fn(),
    };

    const retryWriter = new RetryWriter(writer as any, deadLetter as any);

    await retryWriter.write(log);

    expect(writer.insert).toHaveBeenCalledTimes(1);
    expect(deadLetter.write).not.toHaveBeenCalled();
  });

  it("retries failed writes and sends the log to dead letter after all retries fail", async () => {
    const writer = {
      insert: vi.fn().mockImplementation(() => {
        throw new Error("SQLite write failed");
      }),
    };

    const deadLetter = {
      write: vi.fn(),
    };

    const retryWriter = new RetryWriter(
      writer as any,
      deadLetter as any,
      [10, 10, 10],
    );

    await retryWriter.write(log);

    expect(writer.insert).toHaveBeenCalledTimes(4);
    expect(deadLetter.write).toHaveBeenCalledTimes(1);
    expect(deadLetter.write).toHaveBeenCalledWith(log, "SQLite write failed");
  });
});
