export type BackendMode = "auto" | "http" | "python" | "docker";
export type BackendType = "http" | "python" | "docker" | "unknown";
export type OutputFormat = "markdown" | "html" | "layout" | "json";

export type ChandraClientOptions = {
  baseUrl?: string;
  apiKey?: string;
  backend?: BackendMode;
  autoStart?: boolean;
  fallbackToLocal?: boolean;
  localHost?: string;
  localPort?: number;
  startupTimeoutMs?: number;
  requestTimeoutMs?: number;
  startupPreference?: Array<"python" | "docker">;
  python?: {
    executable?: string;
    moduleName?: string;
    workingDirectory?: string;
    env?: Record<string, string>;
  };
  docker?: {
    image?: string;
    containerName?: string;
    port?: number;
    env?: Record<string, string>;
    gpus?: string;
  };
};

export type ProcessFileOptions = {
  pageRange?: string;
  includeImages?: boolean;
  includeHeadersFooters?: boolean;
  formats?: OutputFormat[];
  outputDir?: string;
  maxOutputTokens?: number;
  batchSize?: number;
  maxWorkers?: number;
  method?: "hf" | "vllm";
  maxRetries?: number;
  metadata?: Record<string, unknown>;
};

export type ProcessBufferOptions = ProcessFileOptions & {
  filename?: string;
  mimeType?: string;
};

export type ProcessDirectoryOptions = ProcessFileOptions & {
  recursive?: boolean;
  glob?: string | string[];
  continueOnError?: boolean;
  maxConcurrency?: number;
};

export type ChandraHealthStatus = {
  ok: boolean;
  backendType: BackendType;
  baseUrl?: string;
  version?: string;
  model?: string;
  details?: Record<string, unknown>;
};

export type ResolvedBackendInfo = {
  mode: "remote" | "local-existing" | "local-started";
  backendType: "http" | "python" | "docker";
  baseUrl: string;
  startedByClient: boolean;
  pid?: number;
  containerId?: string;
};

export type ChandraLayoutBlock = {
  bbox: [number, number, number, number];
  label: string;
  content: string;
};

export type ChandraImageAsset = {
  name: string;
  path?: string;
  mimeType?: string;
  width?: number;
  height?: number;
};

export type ChandraPageResult = {
  pageNumber: number;
  markdown?: string;
  html?: string;
  json?: unknown;
  layout?: ChandraLayoutBlock[];
  images?: ChandraImageAsset[];
  metadata?: Record<string, unknown>;
};

export type ChandraDocumentResult = {
  input: {
    filename?: string;
    path?: string;
    mimeType?: string;
    pageRange?: string;
  };
  backend: ResolvedBackendInfo;
  markdown?: string;
  html?: string;
  json?: unknown;
  layout?: ChandraLayoutBlock[];
  images?: ChandraImageAsset[];
  pages?: ChandraPageResult[];
  metadata: {
    pageCount?: number;
    tokenCount?: number;
    processingMs?: number;
    outputDir?: string;
    [key: string]: unknown;
  };
};

export type ChandraErrorCode =
  | "INVALID_CONFIG"
  | "INVALID_INPUT"
  | "FILE_NOT_FOUND"
  | "UNSUPPORTED_FILE_TYPE"
  | "INVALID_PAGE_RANGE"
  | "REMOTE_UNREACHABLE"
  | "LOCAL_BACKEND_UNAVAILABLE"
  | "AUTOSTART_DISABLED"
  | "PYTHON_NOT_FOUND"
  | "PYTHON_PACKAGE_MISSING"
  | "DOCKER_NOT_FOUND"
  | "DOCKER_START_FAILED"
  | "PORT_IN_USE"
  | "BACKEND_START_TIMEOUT"
  | "BACKEND_NOT_READY"
  | "PROCESSING_FAILED"
  | "INVALID_BRIDGE_RESPONSE"
  | "INTERNAL_ERROR";

export type ChandraErrorShape = {
  code: ChandraErrorCode;
  message: string;
  details?: Record<string, unknown>;
};

export type ChandraBatchResult = {
  outputDir?: string;
  successCount: number;
  failureCount: number;
  results: Array<{
    inputPath: string;
    result?: ChandraDocumentResult;
    error?: ChandraErrorShape;
  }>;
};

export type BridgeProcessOptions = ProcessFileOptions;

export type BridgeProcessSuccessResponse = {
  ok: true;
  result: {
    markdown?: string;
    html?: string;
    json?: unknown;
    layout?: ChandraLayoutBlock[];
    images?: ChandraImageAsset[];
    pages?: ChandraPageResult[];
    metadata: Record<string, unknown>;
  };
};

export type BridgeErrorResponse = {
  ok: false;
  error: ChandraErrorShape;
};

export type BridgeProcessResponse = BridgeProcessSuccessResponse | BridgeErrorResponse;
