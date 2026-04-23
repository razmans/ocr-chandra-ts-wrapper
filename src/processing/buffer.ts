import type { ProcessBufferOptions, ResolvedBackendInfo, BridgeProcessSuccessResponse } from "../types.js";
import { HttpClient } from "../backend/http-client.js";

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
  return http.postMultipart<BridgeProcessSuccessResponse>("/process/upload", formData);
}
