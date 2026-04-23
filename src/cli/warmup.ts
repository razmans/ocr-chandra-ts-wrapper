import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ChandraClient } from "../client.js";

export async function runWarmup(): Promise<void> {
  const client = new ChandraClient({ backend: "auto" });
  const tempDir = await mkdtemp(join(tmpdir(), "chandra-ts-warmup-"));
  const tempPdf = join(tempDir, "warmup.pdf");

  const minimalPdf = `%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]/Contents 4 0 R>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 72 120 Td (Warmup) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000110 00000 n \n0000000197 00000 n \ntrailer<</Root 1 0 R/Size 5>>\nstartxref\n292\n%%EOF\n`;

  await writeFile(tempPdf, minimalPdf, "utf8");

  try {
    const result = await client.processFile(tempPdf, {
      pageRange: "1",
      method: "hf",
      maxRetries: 1,
      includeImages: false,
      includeHeadersFooters: false
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          message: "Warmup completed.",
          metadata: result.metadata
        },
        null,
        2
      )
    );
  } finally {
    await client.shutdown();
    await rm(tempDir, { recursive: true, force: true });
  }
}
