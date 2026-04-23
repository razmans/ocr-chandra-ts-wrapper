import { getDefaultLocalBaseUrl, type ResolvedClientConfig } from "../config.js";
import { ChandraError, toChandraError } from "../errors.js";
import type { ResolvedBackendInfo } from "../types.js";
import { probeHealth } from "./health.js";
import { PythonLauncher } from "../runtime/python-launcher.js";
import { DockerLauncher } from "../runtime/docker-launcher.js";

export class BackendResolver {
  private resolvedBackend: ResolvedBackendInfo | null = null;
  private resolutionPromise: Promise<ResolvedBackendInfo> | null = null;
  private pythonLauncher: PythonLauncher | null = null;

  constructor(private readonly config: ResolvedClientConfig) {}

  async resolve(): Promise<ResolvedBackendInfo> {
    if (this.resolvedBackend) {
      return this.resolvedBackend;
    }

    if (this.resolutionPromise) {
      return this.resolutionPromise;
    }

    this.resolutionPromise = this.resolveInternal();
    try {
      this.resolvedBackend = await this.resolutionPromise;
      return this.resolvedBackend;
    } finally {
      this.resolutionPromise = null;
    }
  }

  async shutdownOwnedBackend(): Promise<void> {
    if (this.resolvedBackend?.startedByClient && this.resolvedBackend.backendType === "python" && this.pythonLauncher) {
      await this.pythonLauncher.shutdown();
    }
    this.clear();
  }

  clear(): void {
    this.resolvedBackend = null;
    this.resolutionPromise = null;
  }

  private async resolveInternal(): Promise<ResolvedBackendInfo> {
    if (this.config.baseUrl) {
      const remoteHealth = await probeHealth(this.config.baseUrl);
      if (remoteHealth.ok) {
        return {
          mode: "remote",
          backendType: "http",
          baseUrl: this.config.baseUrl,
          startedByClient: false
        };
      }

      if (!this.config.fallbackToLocal) {
        throw new ChandraError("REMOTE_UNREACHABLE", `Failed to connect to configured Chandra server at ${this.config.baseUrl}.`, {
          health: remoteHealth
        });
      }
    }

    const localBaseUrl = getDefaultLocalBaseUrl(this.config.localHost, this.config.localPort);
    const localHealth = await probeHealth(localBaseUrl);
    if (localHealth.ok) {
      return {
        mode: "local-existing",
        backendType: localHealth.backendType === "unknown" ? "http" : (localHealth.backendType as "http" | "python" | "docker"),
        baseUrl: localBaseUrl,
        startedByClient: false
      };
    }

    if (localHealth.details?.status || localHealth.details?.isBridge === false) {
      throw new ChandraError("PORT_IN_USE", `Port ${this.config.localPort} is already in use by a non-Chandra or invalid service.`, {
        baseUrl: localBaseUrl,
        health: localHealth
      });
    }

    if (!this.config.autoStart) {
      throw new ChandraError("LOCAL_BACKEND_UNAVAILABLE", `No Chandra backend detected at ${localBaseUrl} and autoStart is disabled.`);
    }

    const launcherErrors: Array<{ launcher: string; error: ReturnType<ChandraError["toJSON"]> }> = [];

    for (const launcherName of this.config.startupPreference) {
      try {
        if (launcherName === "python") {
          this.pythonLauncher = new PythonLauncher(this.config);
          return await this.pythonLauncher.launch();
        }
        if (launcherName === "docker") {
          return await new DockerLauncher().launch();
        }
      } catch (error) {
        launcherErrors.push({
          launcher: launcherName,
          error: toChandraError(error, "BACKEND_START_TIMEOUT").toJSON()
        });
      }
    }

    throw new ChandraError("BACKEND_START_TIMEOUT", "Unable to start a local Chandra backend with the configured launchers.", {
      launcherErrors
    });
  }
}
