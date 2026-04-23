import type { ChandraErrorCode, ChandraErrorShape } from "./types.js";

export class ChandraError extends Error {
  public readonly code: ChandraErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(code: ChandraErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ChandraError";
    this.code = code;
    this.details = details;
  }

  toJSON(): ChandraErrorShape {
    return {
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
}

export function toChandraError(error: unknown, fallbackCode: ChandraErrorCode = "INTERNAL_ERROR"): ChandraError {
  if (error instanceof ChandraError) {
    return error;
  }

  if (error instanceof Error) {
    return new ChandraError(fallbackCode, error.message);
  }

  return new ChandraError(fallbackCode, "Unknown error", { error });
}
