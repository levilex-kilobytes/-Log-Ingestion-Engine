export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export interface LogEntry {
  timestamp: string;
  service: string;
  level: LogLevel;
  message: string;
}

export interface QueuedLog {
  log: LogEntry;
  sourceIp: string;
}

export interface EnrichedLog extends LogEntry {
  received_at: string;
  source_ip: string;
  env: string;
}
