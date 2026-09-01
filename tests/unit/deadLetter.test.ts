import { beforeEach, afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { DeadLetterWriter } from "../../src/storage/deadLetter";

const testFile = path.resolve("test-logs-failed.json");

describe("DeadLetterWriter", () => {
  beforeEach(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  it("writes a failed log to the dead letter file", async () => {
    const writer = new DeadLetterWriter(testFile);

    const log = {
      timestamp: "2026-08-26T10:00:00Z",
      service: "service1",
      level: "ERROR" as const,
      message: "Database failed",
      received_at: "2026-08-26T10:00:00.123456Z",
      source_ip: "127.0.0.1",
      env: "production",
    };

    await writer.write(log, "SQLite write failed");

    const content = JSON.parse(fs.readFileSync(testFile, "utf-8"));

    expect(content).toHaveLength(1);
    expect(content[0].log).toEqual(log);
    expect(content[0].error).toBe("SQLite write failed");
    expect(content[0].timestamp).toBeDefined();
  });
});
