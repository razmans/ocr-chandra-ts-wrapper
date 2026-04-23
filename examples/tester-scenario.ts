import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ChandraClient } from "../src/index.js";

async function main(): Promise<void> {
  const inputPath = resolve(process.argv[2] ?? "./fixtures/sample-input.txt");
  const mode = process.argv[3] ?? "remote";

  const client = new ChandraClient(
    mode === "remote"
      ? { baseUrl: process.env.CHANDRA_BASE_URL ?? "http://127.0.0.1:8282" }
      : { backend: "auto" }
  );

  console.log(`Using mode: ${mode}`);
  console.log(`Input: ${inputPath}`);

  const health = await client.healthCheck();
  console.log("Health:", health);

  const fileResult = await client.processFile(inputPath, {
    formats: ["markdown", "html", "layout"]
  });
  console.log("File result metadata:", fileResult.metadata);

  const buffer = await readFile(inputPath);
  const bufferResult = await client.processBuffer(buffer, {
    filename: inputPath.split(/[\\/]/).pop() ?? "sample-input.txt",
    formats: ["markdown", "html", "layout"]
  });
  console.log("Buffer result metadata:", bufferResult.metadata);

  await client.shutdown();
}

main().catch((error) => {
  console.error("Tester scenario failed:", error);
  process.exit(1);
});
