import type { LogEntry } from "../types/log";
import type { RoutingRule } from "../types/routing";

export function routeLog(
  log: LogEntry,
  rules: RoutingRule[],
): string {
  for (const rule of rules) {
    if (log[rule.field] === rule.value) {
      return rule.destination;
    }
  }

  return "default";
}
