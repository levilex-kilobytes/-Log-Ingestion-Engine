import type { EnrichedLog } from "../types/log";

export class FallbackQueue {
  private readonly queues = new Map<string, EnrichedLog[]>();

  push(destination: string, log: EnrichedLog): void {
    const queue = this.queues.get(destination) ?? [];

    queue.push(log);

    this.queues.set(destination, queue);
  }

  pull(destination: string, batchSize: number): EnrichedLog[] {
    const queue = this.queues.get(destination);

    if (!queue) {
      return [];
    }

    return queue.splice(0, batchSize);
  }

  size(destination: string): number {
    return this.queues.get(destination)?.length ?? 0;
  }
}
