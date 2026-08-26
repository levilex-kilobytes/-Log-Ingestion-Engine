export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export interface LogEntry {
  timestamp: string;
  service: string;
  level: LogLevel;
  message: string;
}

export interface ValidationError {
  field: string;
  reason: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const VALID_LEVELS: LogLevel[] = ["INFO", "WARN", "ERROR", "DEBUG"];

function isValidISO8601(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

export function validateLog(log: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof log !== "object" || log === null) {
    return {
      valid: false,
      errors: [
        {
          field: "log",
          reason: "must be an object",
        },
      ],
    };
  }

  const entry = log as Record<string, unknown>;

  // timestamp
  if (!entry.timestamp) {
    errors.push({
      field: "timestamp",
      reason: "is required",
    });
  } else if (!isValidISO8601(entry.timestamp)) {
    errors.push({
      field: "timestamp",
      reason: "must be a valid ISO 8601 timestamp",
    });
  }

  // service
  if (!entry.service) {
    errors.push({
      field: "service",
      reason: "is required",
    });
  } else if (typeof entry.service !== "string") {
    errors.push({
      field: "service",
      reason: "must be a string",
    });
  } else if (entry.service.length > 100) {
    errors.push({
      field: "service",
      reason: "must not exceed 100 characters",
    });
  }

  // level
  if (!entry.level) {
    errors.push({
      field: "level",
      reason: "is required",
    });
  } else if (
    typeof entry.level !== "string" ||
    !VALID_LEVELS.includes(entry.level as LogLevel)
  ) {
    errors.push({
      field: "level",
      reason: "must be one of INFO/WARN/ERROR/DEBUG",
    });
  }

  // message
  if (!entry.message) {
    errors.push({
      field: "message",
      reason: "is required",
    });
  } else if (typeof entry.message !== "string") {
    errors.push({
      field: "message",
      reason: "must be a string",
    });
  } else if (entry.message.length > 10000) {
    errors.push({
      field: "message",
      reason: "must not exceed 10000 characters",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
