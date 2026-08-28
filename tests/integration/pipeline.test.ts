import { describe, expect, it } from "vitest";
import { RawLogChannel } from "../../src/queue/rawLogChannel";
import { LogConsumer } from "../../src/queue/logConsumer";
import { enrichLog } from "../../src/enrichment/logEnricher";
import { routeLog } from "../../src/routing/route";
import { loadRules } from "../../src/routing/rulesLoader";
import type { LogEntry } from "../../src/types/log";

describe("Log processing pipeline", () => {
  it("consumes, enriches, and routes logs", async () => {
    const channel = new RawLogChannel(100);

    const log: LogEntry = {
      timestamp: "2026-08-26T10:00:00Z",
      service: "claims",
      level: "ERROR",
      message: "Database failed",
    };

    await channel.push(log);

    const rules = loadRules();

    let processedLog: ReturnType<typeof enrichLog> | undefined;
    let destination: string | undefined;

    const fakeRequest = {
      headers: {},
      socket: {
        remoteAddress: "127.0.0.1",
      },
    } as any;

    const consumer = new LogConsumer(channel, async (logs) => {
      for (const entry of logs) {
        processedLog = enrichLog(entry, fakeRequest);
        destination = routeLog(processedLog, rules);
      }
    });

    consumer.start();

    await new Promise((resolve) => setTimeout(resolve, 150));

    consumer.stop();

    expect(processedLog).toBeDefined();
    expect(processedLog?.service).toBe("claims");
    expect(processedLog?.source_ip).toBe("127.0.0.1");
    expect(processedLog?.received_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/,
    );
    expect(destination).toBe("queue_service1");
  });
});
