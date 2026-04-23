export type CliArgs = {
  command: "process" | "health" | "info" | "setup";
  input?: string;
  output?: string;
  baseUrl?: string;
};

export function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);

  if (args[0] === "health") {
    return { command: "health", baseUrl: readFlag(args, "--base-url") };
  }

  if (args[0] === "info") {
    return { command: "info", baseUrl: readFlag(args, "--base-url") };
  }

  if (args[0] === "setup") {
    return { command: "setup" };
  }

  return {
    command: "process",
    input: args[0],
    output: args[1],
    baseUrl: readFlag(args, "--base-url")
  };
}

function readFlag(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}
