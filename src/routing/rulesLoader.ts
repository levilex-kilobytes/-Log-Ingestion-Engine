import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { RoutingRule } from "../types/routing";

export function loadRules(): RoutingRule[] {
  const filePath = path.resolve("config/rules.yaml");
  const file = fs.readFileSync(filePath, "utf-8");

  const config = parse(file);

  return config.rules as RoutingRule[];
}
