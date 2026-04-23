import type { ProcessFileOptions, ResolvedBackendInfo, BridgeProcessResponse, BridgeProcessSuccessResponse } from "../types.js";
import { HttpClient } from "../backend/http-client.js";
import { expectBridgeSuccess } from "../backend/bridge-response.js";

export async function processFileRequest(
  backend: ResolvedBackendInfo,
  inputPath: string,
  options?: ProcessFileOptions
): Promise<BridgeProcessSuccessResponse> {
  const http = new HttpClient(backend.baseUrl);
  const response = await http.postJson<BridgeProcessResponse>("/process/file", {
    inputPath,
    options
  });
  return expectBridgeSuccess(response);
}
