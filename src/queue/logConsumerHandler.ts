import type { LogEntry } from "../types/log";

export async function handleLogBatch(logs: LogEntry[]): Promise<void> {
  // Processing pipeline will be connected here.
  // Phase 2 routing and enrichment will consume these logs.
  void logs;
}
