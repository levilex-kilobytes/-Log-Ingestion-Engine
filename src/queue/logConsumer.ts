import type { LogEntry } from "../types/log";
import { RawLogChannel } from "./rawLogChannel";

const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_INTERVAL_MS = 100;

export type LogBatchHandler = (logs: LogEntry[]) => Promise<void>;

export class LogConsumer {
  private readonly batchSize: number;
  private readonly intervalMs: number;
  private running = false;

  constructor(
    private readonly channel: RawLogChannel,
    private readonly handler: LogBatchHandler,
  ) {
    this.batchSize = Number(
      process.env.RAW_LOG_BATCH_SIZE ?? DEFAULT_BATCH_SIZE,
    );

    this.intervalMs = Number(
      process.env.RAW_LOG_CONSUMER_INTERVAL_MS ?? DEFAULT_INTERVAL_MS,
    );
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    void this.consume();
  }

  stop(): void {
    this.running = false;
  }

  private async consume(): Promise<void> {
    while (this.running) {
      const batch = this.channel.pullBatch(this.batchSize);

      if (batch.length > 0) {
        await this.handler(batch);
      }

      await new Promise((resolve) => setTimeout(resolve, this.intervalMs));
    }
  }
}
