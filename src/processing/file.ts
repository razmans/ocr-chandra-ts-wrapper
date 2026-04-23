import type { ProcessFileOptions, ResolvedBackendInfo, BridgeProcessSuccessResponse } from "../types.js";
import { HttpClient } from "../backend/http-client.js";

export async function processFileRequest(
  backend: ResolvedBackendInfo,
  inputPath: string,
  options?: ProcessFileOptions
): Promise<BridgeProcessSuccessResponse> {
  const http = new HttpClient(backend.baseUrl);
  return http.postJson<BridgeProcessSuccessResponse>("/process/file", {
    inputPath,
    options
  });
}
