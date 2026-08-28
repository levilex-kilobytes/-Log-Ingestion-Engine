import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import { BatchWriter } from "../../src/storage/batchWriter";
import { SQLiteStore } from "../../src/storage/sqlite";
import type { EnrichedLog } from "../../src/types/log";

const databasePath = "test_batch_writer.db";

const createLog = (index: number): EnrichedLog => ({
  timestamp: "2026-08-26T10:00:00Z",
  service: "service1",
  level: "INFO",
  message: `Log ${index}`,
  received_at: "2026-08-26T10:00:00.123456Z",
  source_ip: "127.0.0.1",
  env: "production",
});

afterEach(() => {
  if (fs.existsSync(databasePath)) {
    fs.unlinkSync(databasePath);
  }

  vi.useRealTimers();
});

describe("BatchWriter", () => {
  it("writes logs when the batch reaches 100", async () => {
    const store = new SQLiteStore(databasePath);
    const writer = new BatchWriter(store, 100, 1000);

    for (let i = 0; i < 100; i++) {
      await writer.add(createLog(i));
    }

    const rows = store
      .getDatabase()
      .prepare("SELECT * FROM logs")
      .all();

    expect(rows).toHaveLength(100);

    writer.stop();
    store.close();
  });

  it("writes logs after 1 second even when fewer than 100 exist", async () => {
    vi.useFakeTimers();

    const store = new SQLiteStore(databasePath);
    const writer = new BatchWriter(store, 100, 1000);

    await writer.add(createLog(1));

    let rows = store
      .getDatabase()
      .prepare("SELECT * FROM logs")
      .all();

    expect(rows).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(1000);

    rows = store
      .getDatabase()
      .prepare("SELECT * FROM logs")
      .all();

    expect(rows).toHaveLength(1);

    writer.stop();
    store.close();
  });
});
