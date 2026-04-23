import { resolveClientConfig } from "../dist/config.js";
import { ensureManagedPythonRuntime } from "../dist/runtime/bootstrap.js";

const config = resolveClientConfig();
const runtime = await ensureManagedPythonRuntime(config);
console.log(`Managed Python runtime ready: ${runtime.pythonPath}`);
