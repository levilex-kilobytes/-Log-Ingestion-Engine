export interface RoutingRule {
  field: "service" | "level";
  value: string;
  destination: string;
}
