import { describe, expect, it } from "vitest";
import { loadRules } from "../../src/routing/rulesLoader";
describe("loadRules", () => {
  it("loads routing rules from the YAML configuration", () => {
    const rules = loadRules();
    expect(rules).toEqual([
      { field: "service", value: "claims", destination: "queue_service1" },
      { field: "service", value: "payments", destination: "queue_service2" },
      { field: "service", value: "users", destination: "queue_service3" },
      { field: "level", value: "ERROR", destination: "queue_service2" },
    ]);
  });
});
