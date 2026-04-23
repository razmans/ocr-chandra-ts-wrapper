import { ChandraError } from "../errors.js";
import type { BridgeProcessResponse, BridgeProcessSuccessResponse } from "../types.js";

export function expectBridgeSuccess(response: BridgeProcessResponse): BridgeProcessSuccessResponse {
  if (!response || typeof response !== "object") {
    throw new ChandraError("INVALID_BRIDGE_RESPONSE", "Bridge returned an empty or non-object response.");
  }

  if (response.ok === false) {
    throw new ChandraError(response.error.code, response.error.message, response.error.details);
  }

  if (response.ok !== true || !("result" in response) || !response.result) {
    throw new ChandraError("INVALID_BRIDGE_RESPONSE", "Bridge returned a malformed success response.", {
      response
    });
  }

  return response;
}
