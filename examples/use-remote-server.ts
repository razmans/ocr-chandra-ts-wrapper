import { ChandraClient } from "../src/index.js";

const client = new ChandraClient({
  baseUrl: "http://127.0.0.1:8282"
});

const result = await client.processFile("input.pdf");
console.log(result);
