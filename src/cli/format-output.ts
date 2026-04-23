import type { ChandraHealthStatus } from "../types.js";

export function formatHealth(status: ChandraHealthStatus): string {
  if (!status.ok) {
    return `NOT OK ${status.baseUrl ?? "<unknown>"}`;
  }

  return [
    "OK chandra-bridge",
    `URL: ${status.baseUrl ?? "<unknown>"}`,
    `Backend: ${status.backendType}`,
    `Version: ${status.version ?? "unknown"}`,
    `Model: ${status.model ?? "unknown"}`
  ].join("\n");
}
