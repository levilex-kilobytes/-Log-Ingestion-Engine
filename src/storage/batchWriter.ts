import type { EnrichedLog } from "../types/log";
import type { SQLiteStore } from "./sqlite";

export class BatchWriter {
  private readonly batch: EnrichedLog[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly store: SQLiteStore,
    private readonly batchSize: number = 100,
    private readonly intervalMs: number = 1000,
  ) {}

  async add(log: EnrichedLog): Promise<void> {
    this.batch.push(log);

    if (this.batch.length >= this.batchSize) {
      await this.flush();
      return;
    }

    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.timer) {
      return;
    }

    this.timer = setTimeout(() => {
      this.timer = undefined;
      void this.flush();
    }, this.intervalMs);

    // Don't keep the Node.js process alive just because of this timer.
    if (
      typeof this.timer === "object" &&
      this.timer !== null &&
      "unref" in this.timer &&
      typeof this.timer.unref === "function"
    ) {
      this.timer.unref();
    }
  }

  private async flush(): Promise<void> {
    if (this.batch.length === 0) {
      return;
    }

    const logs = this.batch.splice(0, this.batch.length);

    this.store.insertBatch(logs);
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  async close(): Promise<void> {
    this.stop();
    await this.flush();
  }
}
