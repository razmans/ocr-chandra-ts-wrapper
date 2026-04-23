import { resolveClientConfig } from "../config.js";
import { ensureManagedPythonRuntime } from "../runtime/bootstrap.js";

export async function runSetup(): Promise<void> {
  const config = resolveClientConfig();
  const runtime = await ensureManagedPythonRuntime(config);
  console.log(
    JSON.stringify(
      {
        ok: true,
        message: "Managed Python runtime ready.",
        runtime,
        note: "Remote/baseUrl mode remains the recommended production path."
      },
      null,
      2
    )
  );
}
