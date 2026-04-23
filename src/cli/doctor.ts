import { join } from "node:path";
import { resolveClientConfig } from "../config.js";
import { ensureManagedPythonRuntime } from "../runtime/bootstrap.js";
import { probeHealth } from "../backend/health.js";

export async function runDoctor(): Promise<void> {
  const config = resolveClientConfig();
  const runtime = await ensureManagedPythonRuntime(config);
  const managedChandra = join(process.cwd(), config.python.venvDir, "bin", "chandra");
  const health = await probeHealth(`http://${config.localHost}:${config.localPort}`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        runtime,
        managedChandra,
        localProbe: health,
        recommendations: [
          "Prefer baseUrl/remote mode for production use.",
          "Use warmup before first heavy local OCR run.",
          "If local OCR still fails, keep remote mode as primary."
        ]
      },
      null,
      2
    )
  );
}
