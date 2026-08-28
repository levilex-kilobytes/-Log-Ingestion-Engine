import type { EnrichedLog } from "../types/log";

export interface Metrics {
  total_logs: number;
  logs_by_level: Record<string, number>;
  logs_by_service: Record<string, number>;
  error_rate: number;
  throughput: number;
  queue_backlog: number;
}

export class MetricsCollector {
  private totalLogs = 0;
  private readonly logsByLevel: Record<string, number> = {};
  private readonly logsByService: Record<string, number> = {};
  private errorLogs = 0;

  private windowStart = Date.now();
  private windowLogs = 0;

  private queueBacklog = 0;

  record(log: EnrichedLog): void {
    this.totalLogs++;
    this.windowLogs++;

    this.logsByLevel[log.level] =
      (this.logsByLevel[log.level] ?? 0) + 1;

    this.logsByService[log.service] =
      (this.logsByService[log.service] ?? 0) + 1;

    if (log.level === "ERROR") {
      this.errorLogs++;
    }
  }

  setQueueBacklog(size: number): void {
    this.queueBacklog = Math.max(0, size);
  }

  getMetrics(): Metrics {
    const elapsedSeconds = (Date.now() - this.windowStart) / 1000;

    const throughput =
      elapsedSeconds > 0
        ? this.windowLogs / elapsedSeconds
        : 0;

    const errorRate =
      this.totalLogs > 0
        ? (this.errorLogs / this.totalLogs) * 100
        : 0;

    return {
      total_logs: this.totalLogs,
      logs_by_level: { ...this.logsByLevel },
      logs_by_service: { ...this.logsByService },
      error_rate: Number(errorRate.toFixed(2)),
      throughput: Number(throughput.toFixed(2)),
      queue_backlog: this.queueBacklog,
    };
  }

  reset(): void {
    this.totalLogs = 0;
    this.errorLogs = 0;
    this.windowLogs = 0;

    Object.keys(this.logsByLevel).forEach((key) => {
      delete this.logsByLevel[key];
    });

    Object.keys(this.logsByService).forEach((key) => {
      delete this.logsByService[key];
    });

    this.queueBacklog = 0;
    this.windowStart = Date.now();
  }
}

export const metrics = new MetricsCollector();