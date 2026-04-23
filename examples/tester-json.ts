import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ChandraClient } from "../src/index.js";

async function main(): Promise<void> {
  const inputPath = resolve(process.argv[2] ?? "./examples/fixtures/sample-input.txt");
  const mode = process.argv[3] ?? "remote";

  const client = new ChandraClient(
    mode === "remote"
      ? { baseUrl: process.env.CHANDRA_BASE_URL ?? "http://127.0.0.1:8282" }
      : { backend: "auto" }
  );

  const health = await client.healthCheck();

  const fileResult = await client.processFile(inputPath, {
    formats: ["markdown", "html", "layout", "json"]
  });

  const buffer = await readFile(inputPath);
  const bufferResult = await client.processBuffer(buffer, {
    filename: inputPath.split(/[\\/]/).pop() ?? "sample-input.txt",
    formats: ["markdown", "html", "layout", "json"]
  });

  await client.shutdown();

  console.log(
    JSON.stringify(
      {
        mode,
        inputPath,
        health,
        fileResult,
        bufferResult
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? { name: error.name, message: error.message } : error
      },
      null,
      2
    )
  );
  process.exit(1);
});
