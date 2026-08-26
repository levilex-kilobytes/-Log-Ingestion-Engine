import { describe, expect, it } from "vitest";
import { validateLog } from "../../src/validation/logValidator";

describe("validateLog", () => {
  it("accepts a valid log", () => {
    const result = validateLog({
      timestamp: "2026-08-26T10:00:00Z",
      service: "claims",
      level: "ERROR",
      message: "Database failed",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects a missing timestamp", () => {
    const result = validateLog({
      service: "claims",
      level: "ERROR",
      message: "Database failed",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      field: "timestamp",
      reason: "is required",
    });
  });

  it("rejects an invalid timestamp", () => {
    const result = validateLog({
      timestamp: "not-a-date",
      service: "claims",
      level: "ERROR",
      message: "Database failed",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      field: "timestamp",
      reason: "must be a valid ISO 8601 timestamp",
    });
  });

  it("rejects an invalid level", () => {
    const result = validateLog({
      timestamp: "2026-08-26T10:00:00Z",
      service: "claims",
      level: "INVALID",
      message: "Database failed",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      field: "level",
      reason: "must be one of INFO/WARN/ERROR/DEBUG",
    });
  });

  it("rejects a service longer than 100 characters", () => {
    const result = validateLog({
      timestamp: "2026-08-26T10:00:00Z",
      service: "a".repeat(101),
      level: "INFO",
      message: "Test",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      field: "service",
      reason: "must not exceed 100 characters",
    });
  });

  it("rejects a message longer than 10000 characters", () => {
    const result = validateLog({
      timestamp: "2026-08-26T10:00:00Z",
      service: "claims",
      level: "INFO",
      message: "a".repeat(10001),
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      field: "message",
      reason: "must not exceed 10000 characters",
    });
  });

  it("accepts all valid log levels", () => {
    const levels = ["INFO", "WARN", "ERROR", "DEBUG"];

    for (const level of levels) {
      const result = validateLog({
        timestamp: "2026-08-26T10:00:00Z",
        service: "claims",
        level,
        message: "Test",
      });

      expect(result.valid).toBe(true);
    }
  });
});
