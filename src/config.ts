import type { ChandraClientOptions } from "./types.js";

export const DEFAULT_LOCAL_HOST = "127.0.0.1";
export const DEFAULT_LOCAL_PORT = 8282;
export const DEFAULT_STARTUP_TIMEOUT_MS = 120_000;
export const DEFAULT_REQUEST_TIMEOUT_MS = 300_000;

export type ResolvedClientConfig = Required<
  Omit<ChandraClientOptions, "baseUrl" | "apiKey" | "python" | "docker">
> & {
  baseUrl?: string;
  apiKey?: string;
  python: NonNullable<ChandraClientOptions["python"]> & {
    runtimeRoot: string;
    venvDir: string;
    bridgeRequirementsPath: string;
  };
  docker: NonNullable<ChandraClientOptions["docker"]>;
};

export function resolveClientConfig(options: ChandraClientOptions = {}): ResolvedClientConfig {
  const runtimeRoot = options.python?.workingDirectory ?? ".chandra-ts-runtime";
  const venvDir = `${runtimeRoot}/venv`;
  const bridgeRequirementsPath = `${runtimeRoot}/bridge-requirements.txt`;

  return {
    baseUrl: options.baseUrl,
    apiKey: options.apiKey,
    backend: options.backend ?? "auto",
    autoStart: options.autoStart ?? true,
    fallbackToLocal: options.fallbackToLocal ?? false,
    localHost: options.localHost ?? DEFAULT_LOCAL_HOST,
    localPort: options.localPort ?? DEFAULT_LOCAL_PORT,
    startupTimeoutMs: options.startupTimeoutMs ?? DEFAULT_STARTUP_TIMEOUT_MS,
    requestTimeoutMs: options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
    startupPreference: options.startupPreference ?? ["python", "docker"],
    python: {
      executable: options.python?.executable ?? "python3",
      moduleName: options.python?.moduleName ?? "chandra_ts_bridge",
      workingDirectory: options.python?.workingDirectory,
      env: options.python?.env ?? {},
      runtimeRoot,
      venvDir,
      bridgeRequirementsPath
    },
    docker: {
      image: options.docker?.image ?? "chandra-ts-bridge",
      containerName: options.docker?.containerName ?? "chandra-ts-local",
      port: options.docker?.port ?? DEFAULT_LOCAL_PORT,
      env: options.docker?.env ?? {},
      gpus: options.docker?.gpus
    }
  };
}

export function getDefaultLocalBaseUrl(host = DEFAULT_LOCAL_HOST, port = DEFAULT_LOCAL_PORT): string {
  return `http://${host}:${port}`;
}
