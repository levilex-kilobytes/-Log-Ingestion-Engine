import type { EnrichedLog } from "../types/log";
import type { SQLiteStore } from "./sqlite";
import { DeadLetterWriter } from "./deadLetter";

const DEFAULT_BACKOFF_MS = [1000, 5000, 10000];

export class RetryWriter {
  constructor(
    private readonly store: Pick<SQLiteStore, "insert">,
    private readonly deadLetter: DeadLetterWriter,
    private readonly backoffMs: number[] = DEFAULT_BACKOFF_MS,
  ) {}

  async write(log: EnrichedLog): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.backoffMs.length; attempt++) {
      try {
        this.store.insert(log);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === this.backoffMs.length) {
          break;
        }

        const delay = this.backoffMs[attempt];

        console.warn(`SQLite write failed. Retry ${attempt + 1} in ${delay}ms`);

        await this.delay(delay);
      }
    }

    await this.deadLetter.write(
      log,
      lastError?.message ?? "Unknown SQLite write error",
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
