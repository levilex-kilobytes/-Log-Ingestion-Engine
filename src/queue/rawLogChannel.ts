import type { LogEntry } from "../types/log";

const DEFAULT_BUFFER_SIZE = 10_000;
const DEFAULT_TIMEOUT_MS = 100;

export class RawLogChannel {
  private readonly queue: LogEntry[] = [];

  constructor(
    private readonly bufferSize: number = Number(
      process.env.RAW_LOG_BUFFER_SIZE ?? DEFAULT_BUFFER_SIZE,
    ),
    private readonly timeoutMs: number = Number(
      process.env.RAW_LOG_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS,
    ),
  ) {}

  async push(log: LogEntry): Promise<boolean> {
    const start = Date.now();

    while (this.queue.length >= this.bufferSize) {
      if (Date.now() - start >= this.timeoutMs) {
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, 1));
    }

    this.queue.push(log);

    return true;
  }

  pullBatch(batchSize: number): LogEntry[] {
    return this.queue.splice(0, batchSize);
  }

  size(): number {
    return this.queue.length;
  }
}
