import { mkdir, access, copyFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import type { ResolvedClientConfig } from "../config.js";
import { ChandraError } from "../errors.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = join(__dirname, "..", "..");
const SOURCE_REQUIREMENTS = join(WORKSPACE_ROOT, "bridge", "requirements.txt");

export async function ensureManagedPythonRuntime(config: ResolvedClientConfig): Promise<{ pythonPath: string }> {
  const runtimeRoot = join(WORKSPACE_ROOT, config.python.runtimeRoot);
  const venvDir = join(WORKSPACE_ROOT, config.python.venvDir);
  const bridgeRequirementsPath = join(WORKSPACE_ROOT, config.python.bridgeRequirementsPath);

  await mkdir(runtimeRoot, { recursive: true });
  await copyFile(SOURCE_REQUIREMENTS, bridgeRequirementsPath);

  const pythonExecutable = config.python.executable ?? "python3";
  const venvPython = join(venvDir, "bin", "python");

  if (!(await exists(venvPython))) {
    await runCommand(pythonExecutable, ["-m", "venv", venvDir], WORKSPACE_ROOT, "Failed to create managed Python virtualenv.");
    await runCommand(venvPython, ["-m", "pip", "install", "--upgrade", "pip"], WORKSPACE_ROOT, "Failed to upgrade pip in managed runtime.");
    await runCommand(venvPython, ["-m", "pip", "install", "-r", bridgeRequirementsPath], WORKSPACE_ROOT, "Failed to install managed bridge runtime dependencies.");
  }

  return { pythonPath: venvPython };
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function runCommand(command: string, args: string[], cwd: string, failureMessage: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let stderr = "";
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "inherit", "pipe"]
    });

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
      process.stderr.write(chunk);
    });

    child.once("error", (error) => {
      reject(new ChandraError("PYTHON_NOT_FOUND", `${failureMessage} ${error.message}`, { command, args }));
    });

    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const lower = stderr.toLowerCase();
      const details = { command, args, code, stderr };
      if (lower.includes("ensurepip is not available") || lower.includes("python3-venv")) {
        reject(
          new ChandraError(
            "PYTHON_PACKAGE_MISSING",
            "Managed Python runtime setup failed because Python venv support is missing. Install the system package for venv support (for example `apt install python3.12-venv`) and rerun setup.",
            details
          )
        );
        return;
      }

      reject(new ChandraError("PYTHON_PACKAGE_MISSING", `${failureMessage} Exit code: ${code ?? "unknown"}.`, details));
    });
  });
}
