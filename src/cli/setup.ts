import { resolveClientConfig } from "../config.js";
import { ensureManagedPythonRuntime } from "../runtime/bootstrap.js";

export async function runSetup(): Promise<void> {
  const config = resolveClientConfig();
  const runtime = await ensureManagedPythonRuntime(config);
  console.log(`Managed Python runtime ready: ${runtime.pythonPath}`);
}
