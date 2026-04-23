import type { ProcessBufferOptions, ResolvedBackendInfo, BridgeProcessResponse, BridgeProcessSuccessResponse } from "../types.js";
import { HttpClient } from "../backend/http-client.js";
import { expectBridgeSuccess } from "../backend/bridge-response.js";

export async function processBufferRequest(
  backend: ResolvedBackendInfo,
  input: Buffer,
  options?: ProcessBufferOptions
): Promise<BridgeProcessSuccessResponse> {
  const http = new HttpClient(backend.baseUrl);
  const formData = new FormData();
  const arrayBuffer = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer;
  formData.append("file", new Blob([arrayBuffer]), options?.filename ?? "upload.bin");
  formData.append("options", JSON.stringify(options ?? {}));
  if (options?.filename) {
    formData.append("filename", options.filename);
  }
  const response = await http.postMultipart<BridgeProcessResponse>("/process/upload", formData);
  return expectBridgeSuccess(response);
}
