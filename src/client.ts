import { resolveClientConfig } from "./config.js";
import { toChandraError } from "./errors.js";
import type {
  ChandraBatchResult,
  ChandraClientOptions,
  ChandraDocumentResult,
  ChandraHealthStatus,
  ProcessBufferOptions,
  ProcessDirectoryOptions,
  ProcessFileOptions,
  ResolvedBackendInfo
} from "./types.js";
import { BackendResolver } from "./backend/resolver.js";
import { probeHealth } from "./backend/health.js";
import { normalizeProcessResult, buildBufferInputContext, buildFileInputContext } from "./backend/normalize.js";
import { processFileRequest } from "./processing/file.js";
import { processBufferRequest } from "./processing/buffer.js";
import { processDirectoryWithClient } from "./processing/directory.js";

export class ChandraClient {
  private readonly config;
  private readonly resolver;

  constructor(private readonly options: ChandraClientOptions = {}) {
    this.config = resolveClientConfig(this.options);
    this.resolver = new BackendResolver(this.config);
  }

  async ensureReady(): Promise<ResolvedBackendInfo> {
    return this.resolver.resolve();
  }

  async healthCheck(): Promise<ChandraHealthStatus> {
    const baseUrl = this.config.baseUrl ?? `http://${this.config.localHost}:${this.config.localPort}`;
    return probeHealth(baseUrl);
  }

  async processFile(inputPath: string, options: ProcessFileOptions = {}): Promise<ChandraDocumentResult> {
    try {
      const backend = await this.ensureReady();
      const response = await processFileRequest(backend, inputPath, options);
      return normalizeProcessResult(response, backend, buildFileInputContext(inputPath, options));
    } catch (error) {
      throw toChandraError(error, "PROCESSING_FAILED");
    }
  }

  async processBuffer(input: Buffer, options: ProcessBufferOptions = {}): Promise<ChandraDocumentResult> {
    try {
      const backend = await this.ensureReady();
      const response = await processBufferRequest(backend, input, options);
      return normalizeProcessResult(response, backend, buildBufferInputContext(options));
    } catch (error) {
      throw toChandraError(error, "PROCESSING_FAILED");
    }
  }

  async processDirectory(inputDir: string, outputDir?: string, options: ProcessDirectoryOptions = {}): Promise<ChandraBatchResult> {
    return processDirectoryWithClient(this, inputDir, outputDir, options);
  }

  async shutdown(): Promise<void> {
    await this.resolver.shutdownOwnedBackend();
  }
}
