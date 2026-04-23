import { readFile } from "node:fs/promises";
import { ChandraClient } from "../src/index.js";

const client = new ChandraClient();
const buffer = await readFile("input.pdf");
const result = await client.processBuffer(buffer, {
  filename: "input.pdf",
  formats: ["markdown", "html", "layout"]
});

console.log(result);
