import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import { SQLiteStore } from "../../src/storage/sqlite";
import type { EnrichedLog } from "../../src/types/log";

const testDatabase = "test_service1.db";

const log: EnrichedLog = {
  timestamp: "2026-08-26T10:00:00Z",
  service: "service1",
  level: "ERROR",
  message: "Database failed",
  received_at: "2026-08-26T10:00:00.123456Z",
  source_ip: "127.0.0.1",
  env: "production",
};

afterEach(() => {
  if (fs.existsSync(testDatabase)) {
    fs.unlinkSync(testDatabase);
  }
});

describe("SQLiteStore", () => {
  it("creates the logs table", () => {
    const store = new SQLiteStore(testDatabase);

    const tables = store
      .getDatabase()
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'logs'",
      )
      .all();

    expect(tables).toHaveLength(1);

    store.close();
  });

  it("writes an enriched log to the database", () => {
    const store = new SQLiteStore(testDatabase);

    store.insert(log);

    const rows = store
      .getDatabase()
      .prepare("SELECT * FROM logs")
      .all();

    expect(rows).toHaveLength(1);

    expect(rows[0]).toMatchObject({
      timestamp: log.timestamp,
      service: log.service,
      level: log.level,
      message: log.message,
      received_at: log.received_at,
      source_ip: log.source_ip,
      env: log.env,
    });

    store.close();
  });
});
