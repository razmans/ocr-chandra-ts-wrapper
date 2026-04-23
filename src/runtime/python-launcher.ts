import { access } from "node:fs/promises";
import { spawn, type ChildProcess } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getDefaultLocalBaseUrl, type ResolvedClientConfig } from "../config.js";
import { ChandraError } from "../errors.js";
import type { ResolvedBackendInfo } from "../types.js";
import type { RuntimeLauncher } from "./launcher.js";
import { probeHealth } from "../backend/health.js";
import { sleep } from "../utils/retry.js";
import { ensureManagedPythonRuntime } from "./bootstrap.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = join(__dirname, "..", "..");
const BRIDGE_SERVER_PATH = join(WORKSPACE_ROOT, "bridge", "server.py");

export class PythonLauncher implements RuntimeLauncher {
  private child: ChildProcess | null = null;

  constructor(private readonly config: ResolvedClientConfig, existingChild: ChildProcess | null = null) {
    this.child = existingChild;
  }

  async canLaunch(): Promise<boolean> {
    try {
      await access(BRIDGE_SERVER_PATH);
      return true;
    } catch {
      return false;
    }
  }

  async launch(): Promise<ResolvedBackendInfo> {
    const baseUrl = getDefaultLocalBaseUrl(this.config.localHost, this.config.localPort);

    if (!(await this.canLaunch())) {
      throw new ChandraError("PYTHON_PACKAGE_MISSING", "Bridge server file was not found for Python launcher.", {
        bridgeServerPath: BRIDGE_SERVER_PATH
      });
    }

    const { pythonPath } = await ensureManagedPythonRuntime(this.config);

    const managedChandraBin = join(this.config.python.venvDir, "bin", "chandra");

    this.child = spawn(pythonPath, [BRIDGE_SERVER_PATH], {
      cwd: WORKSPACE_ROOT,
      env: {
        ...process.env,
        ...this.config.python.env,
        CHANDRA_BRIDGE_HOST: this.config.localHost,
        CHANDRA_BRIDGE_PORT: String(this.config.localPort),
        CHANDRA_MANAGED_CHANDRA_BIN: join(WORKSPACE_ROOT, managedChandraBin)
      },
      stdio: ["ignore", "pipe", "pipe"],
      detached: false
    });

    this.child.once("exit", () => {
      this.child = null;
    });

    const started = await this.waitForHealthy(baseUrl, this.config.startupTimeoutMs);
    if (!started) {
      await this.shutdown();
      throw new ChandraError("BACKEND_START_TIMEOUT", `Chandra bridge did not become ready at ${baseUrl} within ${this.config.startupTimeoutMs}ms.`, {
        baseUrl,
        executable: pythonPath
      });
    }

    return {
      mode: "local-started",
      backendType: "python",
      baseUrl,
      startedByClient: true,
      pid: this.child?.pid ?? undefined
    };
  }

  getPid(): number | undefined {
    return this.child?.pid ?? undefined;
  }

  isRunning(): boolean {
    return !!this.child && this.child.exitCode === null && !this.child.killed;
  }

  async shutdown(): Promise<void> {
    if (!this.child) {
      return;
    }

    const pid = this.child.pid;
    if (pid) {
      try {
        process.kill(pid, "SIGTERM");
      } catch {
        // ignore shutdown errors
      }
    }

    this.child = null;
  }

  private async waitForHealthy(baseUrl: string, timeoutMs: number): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const health = await probeHealth(baseUrl);
      if (health.ok) {
        return true;
      }
      await sleep(500);
    }
    return false;
  }
}
