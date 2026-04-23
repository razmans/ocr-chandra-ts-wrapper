import { ChandraClient } from "../src/index.js";

const client = new ChandraClient({
  backend: "auto"
});

const result = await client.processFile("input.pdf");
console.log(result);
