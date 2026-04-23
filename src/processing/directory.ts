import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { ChandraBatchResult, ProcessDirectoryOptions } from "../types.js";
import type { ChandraClient } from "../client.js";
import { toChandraError } from "../errors.js";

export async function processDirectoryWithClient(
  client: ChandraClient,
  inputDir: string,
  outputDir?: string,
  options: ProcessDirectoryOptions = {}
): Promise<ChandraBatchResult> {
  const entries = await readdir(inputDir, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => join(inputDir, entry.name));

  const results: ChandraBatchResult["results"] = [];
  for (const file of files) {
    try {
      const result = await client.processFile(file, { ...options, outputDir });
      results.push({ inputPath: file, result });
    } catch (error) {
      results.push({ inputPath: file, error: toChandraError(error).toJSON() });
      if (!options.continueOnError) {
        break;
      }
    }
  }

  const successCount = results.filter((entry) => entry.result).length;
  const failureCount = results.filter((entry) => entry.error).length;

  return {
    outputDir,
    successCount,
    failureCount,
    results
  };
}
