import type {
  BridgeProcessSuccessResponse,
  ChandraDocumentResult,
  ProcessBufferOptions,
  ProcessFileOptions,
  ResolvedBackendInfo
} from "../types.js";

export function normalizeProcessResult(
  response: BridgeProcessSuccessResponse,
  backend: ResolvedBackendInfo,
  input: { path?: string; filename?: string; mimeType?: string; pageRange?: string }
): ChandraDocumentResult {
  return {
    input,
    backend,
    markdown: response.result.markdown,
    html: response.result.html,
    json: response.result.json,
    layout: response.result.layout,
    images: response.result.images,
    pages: response.result.pages,
    metadata: response.result.metadata ?? {}
  };
}

export function buildBufferInputContext(options: ProcessBufferOptions = {}) {
  return {
    filename: options.filename,
    mimeType: options.mimeType,
    pageRange: options.pageRange
  };
}

export function buildFileInputContext(inputPath: string, options: ProcessFileOptions = {}) {
  return {
    path: inputPath,
    filename: inputPath.split(/[\\/]/).pop(),
    pageRange: options.pageRange
  };
}
