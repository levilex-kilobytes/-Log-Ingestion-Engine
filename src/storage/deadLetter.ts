import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import type { EnrichedLog } from "../types/log";

const DEFAULT_FILE = process.env.DEAD_LETTER_FILE!;
const MAX_FILE_SIZE = Number(process.env.DEAD_LETTER_MAX_SIZE!);

interface DeadLetterEntry {
  log: EnrichedLog;
  error: string;
  timestamp: string;
}

export class DeadLetterWriter {
  constructor(private readonly filePath: string = path.resolve(DEFAULT_FILE)) {}

  async write(log: EnrichedLog, error: string): Promise<void> {
    const entry: DeadLetterEntry = {
      log,
      error,
      timestamp: new Date().toISOString(),
    };

    await this.rotateIfNeeded();

    let entries: DeadLetterEntry[] = [];

    try {
      const content = await fs.readFile(this.filePath, "utf-8");

      if (content.trim()) {
        entries = JSON.parse(content) as DeadLetterEntry[];
      }
    } catch (readError: unknown) {
      const errorCode =
        readError && typeof readError === "object" && "code" in readError
          ? readError.code
          : undefined;

      if (errorCode !== "ENOENT") {
        throw readError;
      }
    }

    entries.push(entry);

    await fs.writeFile(
      this.filePath,
      JSON.stringify(entries, null, 2),
      "utf-8",
    );
  }

  private async rotateIfNeeded(): Promise<void> {
    let stats;

    try {
      stats = await fs.stat(this.filePath);
    } catch (error: unknown) {
      const errorCode =
        error && typeof error === "object" && "code" in error
          ? error.code
          : undefined;

      if (errorCode === "ENOENT") {
        return;
      }

      throw error;
    }

    if (stats.size <= MAX_FILE_SIZE) {
      return;
    }

    const directory = path.dirname(this.filePath);
    const extension = path.extname(this.filePath);
    const name = path.basename(this.filePath, extension);

    let counter = 1;

    let rotatedPath = path.join(directory, `${name}-${counter}${extension}`);

    while (true) {
      try {
        await fs.access(rotatedPath);
        counter++;

        rotatedPath = path.join(directory, `${name}-${counter}${extension}`);
      } catch {
        break;
      }
    }

    await fs.rename(this.filePath, rotatedPath);
  }
}
