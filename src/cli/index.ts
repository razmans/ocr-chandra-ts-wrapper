#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import { ChandraClient } from "../client.js";
import { parseArgs } from "./parse-args.js";
import { formatHealth } from "./format-output.js";
import { runSetup } from "./setup.js";

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const client = new ChandraClient({ baseUrl: args.baseUrl });

  if (args.command === "health") {
    const health = await client.healthCheck();
    console.log(formatHealth(health));
    return;
  }

  if (args.command === "info") {
    const health = await client.healthCheck();
    console.log(JSON.stringify(health, null, 2));
    return;
  }

  if (args.command === "setup") {
    await runSetup();
    return;
  }

  if (!args.input || !args.output) {
    throw new Error("Usage: chandra-ts <input> <output> [--base-url <url>]");
  }

  await mkdir(args.output, { recursive: true });
  const result = await client.processFile(args.input, { outputDir: args.output });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
