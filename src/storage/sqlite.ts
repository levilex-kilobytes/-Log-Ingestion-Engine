import Database from "better-sqlite3";
import type { EnrichedLog } from "../types/log";

export class SQLiteStore {
  private readonly db: Database.Database;

  private readonly insertStatement: Database.Statement;

  constructor(databasePath: string) {
    this.db = new Database(databasePath);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY,
        timestamp TEXT NOT NULL,
        service TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        received_at TEXT NOT NULL,
        source_ip TEXT NOT NULL,
        env TEXT NOT NULL
      )
    `);

    this.insertStatement = this.db.prepare(`
      INSERT INTO logs (
        timestamp,
        service,
        level,
        message,
        received_at,
        source_ip,
        env
      )
      VALUES (
        @timestamp,
        @service,
        @level,
        @message,
        @received_at,
        @source_ip,
        @env
      )
    `);
  }

  insert(log: EnrichedLog): void {
    this.insertStatement.run(log);
  }

  insertBatch(logs: EnrichedLog[]): void {
    const transaction = this.db.transaction(
      (entries: EnrichedLog[]) => {
        for (const log of entries) {
          this.insertStatement.run(log);
        }
      },
    );

    transaction(logs);
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  close(): void {
    this.db.close();
  }
}
