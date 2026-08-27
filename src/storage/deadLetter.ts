import fs from "node:fs";
import path from "node:path";
import type { EnrichedLog } from "../types/log";

const DEFAULT_FILE = "logs-failed.json";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface DeadLetterEntry {
  log: EnrichedLog;
  error: string;
  timestamp: string;
}

export class DeadLetterWriter {
  constructor(private readonly filePath: string = path.resolve(DEFAULT_FILE)) {}

  write(log: EnrichedLog, error: string): void {
    const entry: DeadLetterEntry = {
      log,
      error,
      timestamp: new Date().toISOString(),
    };

    this.rotateIfNeeded();

    let entries: DeadLetterEntry[] = [];

    if (fs.existsSync(this.filePath)) {
      const content = fs.readFileSync(this.filePath, "utf-8");

      if (content.trim()) {
        entries = JSON.parse(content);
      }
    }

    entries.push(entry);

    fs.writeFileSync(this.filePath, JSON.stringify(entries, null, 2), "utf-8");
  }

  private rotateIfNeeded(): void {
    if (!fs.existsSync(this.filePath)) {
      return;
    }

    const stats = fs.statSync(this.filePath);

    if (stats.size <= MAX_FILE_SIZE) {
      return;
    }

    const directory = path.dirname(this.filePath);
    const extension = path.extname(this.filePath);
    const name = path.basename(this.filePath, extension);

    let counter = 1;
    let rotatedPath = path.join(directory, `${name}-${counter}${extension}`);

    while (fs.existsSync(rotatedPath)) {
      counter++;
      rotatedPath = path.join(directory, `${name}-${counter}${extension}`);
    }

    fs.renameSync(this.filePath, rotatedPath);
  }
}
