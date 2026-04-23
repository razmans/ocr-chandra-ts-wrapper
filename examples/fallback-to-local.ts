import { ChandraClient } from "../src/index.js";

const client = new ChandraClient({
  baseUrl: "http://192.168.1.50:8282",
  fallbackToLocal: true
});

const result = await client.processFile("input.pdf");
console.log(result);
