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

  async ensureRemoteReady(): Promise<ResolvedBackendInfo> {
    if (!this.config.baseUrl) {
      throw toChandraError(new Error("Remote mode requires baseUrl."), "INVALID_CONFIG");
    }
    return this.resolver.resolve();
  }

  async healthCheck(): Promise<ChandraHealthStatus> {
    const baseUrl = this.config.baseUrl ?? `http://${this.config.localHost}:${this.config.localPort}`;
    return probeHealth(baseUrl);
  }

  async processFile(inputPath: string, options: ProcessFileOptions = {}): Promise<ChandraDocumentResult> {
    try {
      const backend = await this.ensureReady();
      const effectiveOptions = this.applyLocalDefaults(options, backend);
      const response = await processFileRequest(backend, inputPath, effectiveOptions);
      return normalizeProcessResult(response, backend, buildFileInputContext(inputPath, effectiveOptions));
    } catch (error) {
      throw toChandraError(error, "PROCESSING_FAILED");
    }
  }

  async processBuffer(input: Buffer, options: ProcessBufferOptions = {}): Promise<ChandraDocumentResult> {
    try {
      const backend = await this.ensureReady();
      const effectiveOptions = this.applyLocalDefaults(options, backend);
      const response = await processBufferRequest(backend, input, effectiveOptions);
      return normalizeProcessResult(response, backend, buildBufferInputContext(effectiveOptions));
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

  private applyLocalDefaults<T extends ProcessFileOptions | ProcessBufferOptions>(
    options: T,
    backend: ResolvedBackendInfo
  ): T {
    if (backend.mode === "remote") {
      return options;
    }

    return {
      includeImages: options.includeImages ?? false,
      includeHeadersFooters: options.includeHeadersFooters ?? false,
      pageRange: options.pageRange ?? "1",
      method: options.method ?? "hf",
      batchSize: options.batchSize ?? 1,
      maxRetries: options.maxRetries ?? 1,
      ...options
    };
  }
}
