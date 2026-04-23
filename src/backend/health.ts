import type { ChandraHealthStatus } from "../types.js";

export async function probeHealth(baseUrl: string): Promise<ChandraHealthStatus> {
  const url = `${baseUrl.replace(/\/$/, "")}/health`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { ok: false, backendType: "unknown", baseUrl, details: { status: response.status } };
    }

    const data = (await response.json()) as Record<string, unknown>;
    const isBridge = data.service === "chandra-bridge";
    return {
      ok: data.ok === true && isBridge && data.ready !== false,
      backendType: typeof data.backend === "string" ? (data.backend as ChandraHealthStatus["backendType"]) : "unknown",
      baseUrl,
      version: typeof data.version === "string" ? data.version : undefined,
      model: typeof data.model === "string" ? data.model : undefined,
      details: {
        ...data,
        isBridge
      }
    };
  } catch (error) {
    return {
      ok: false,
      backendType: "unknown",
      baseUrl,
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}
