import { ChandraClient } from "../src/index.js";

const client = new ChandraClient();
const result = await client.processFile("input.pdf", {
  formats: ["markdown", "html", "layout"]
});

console.log(result);
