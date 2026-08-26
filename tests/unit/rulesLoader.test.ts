import { describe, expect, it } from "vitest";
import { loadRules } from "../../src/routing/rulesLoader";

describe("loadRules", () => {
  it("loads routing rules from the YAML configuration", () => {
    const rules = loadRules();

    expect(rules).toEqual([
      {
        field: "service",
        value: "claims",
        destination: "claims-queue",
      },
      {
        field: "level",
        value: "ERROR",
        destination: "error-queue",
      },
    ]);
  });
});
