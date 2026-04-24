# chandra-ts

TypeScript SDK/client for Chandra OCR, with an optional local managed runtime helper.

> Recommended production usage: **remote/server mode via `baseUrl`**. Local mode is supported, but should be treated as an explicit managed-runtime path with setup/doctor/warmup steps.

## Planned behavior

- If `baseUrl` is provided, use that Chandra/bridge server directly
- Remote/server mode is the recommended production path
- If `baseUrl` is not provided, local mode may probe `http://127.0.0.1:8282` and/or use the managed local runtime path
- Local mode targets a managed Python runtime bootstrap instead of assuming a global Chandra install
- Expose a TypeScript SDK and CLI for file, buffer, and directory OCR flows

## Status

This is currently an initial scaffold generated from the design plan. The API surface and file layout are in place, but most runtime behavior is still stubbed.

## Local default

- Host: `127.0.0.1`
- Port: `8282`

## Intended usage

### Remote / existing server mode

If you already host a Chandra bridge/server somewhere, this is the simplest path:

```ts
import { ChandraClient } from "chandra-ts";

const client = new ChandraClient({
  baseUrl: "http://your-server:8282"
});

const result = await client.processFile("input.pdf", {
  formats: ["markdown", "html", "layout"]
});
```

This mode does **not** require a local Python runtime.

### Local managed runtime mode

If you explicitly want the wrapper to run locally on the same machine:

```ts
import { ChandraClient } from "chandra-ts";

const client = new ChandraClient({
  backend: "auto"
});

const result = await client.processFile("input.pdf", {
  formats: ["markdown", "html", "layout"]
});
```

## CLI

```bash
npx chandra-ts input.pdf ./output
npx chandra-ts health
npx chandra-ts info
npx chandra-ts setup
npx chandra-ts doctor
npx chandra-ts warmup
```

## Managed local runtime

To prepare the local Python runtime explicitly:

```bash
npm run setup:local
```

This creates a managed virtualenv under `.chandra-ts-runtime/venv` and installs the bridge/runtime dependencies there.

### Local prerequisites

On Linux systems, local setup may require Python venv support to be installed first.
For example on Debian/Ubuntu:

```bash
apt install python3.12-venv
```

If that package is missing, `npm run setup:local` will fail with a guided error message.

## Recommended user model

- **Use `baseUrl`** if you already have a Chandra bridge/server
- **Treat remote/server mode as the primary production path**
- **Use `npm run setup:local`** only if you want a managed local runtime
- Run `npm run doctor` before depending on local mode
- Run `npm run warmup` before the first meaningful local OCR run

## Tester scenario

A simple development tester has been added at:

- `examples/tester-scenario.ts`
- `examples/tester-json.ts`
- `examples/fixtures/sample-input.txt`

Example remote-mode run:

```bash
CHANDRA_BASE_URL=http://127.0.0.1:8282 npx tsx examples/tester-scenario.ts examples/fixtures/sample-input.txt remote
```

Example local-mode run:

```bash
npx tsx examples/tester-scenario.ts examples/fixtures/sample-input.txt local
```

This tester exercises:
- `healthCheck()`
- `processFile()`
- `processBuffer()`
- `shutdown()`

JSON-output tester:

```bash
CHANDRA_BASE_URL=http://127.0.0.1:8282 npx tsx examples/tester-json.ts examples/fixtures/sample-input.txt remote
```

## Bridge

The local bridge is scaffolded under `bridge/` and is intended to run as a FastAPI service on port `8282`.
