export function describeOutputTarget(outputDir?: string): string {
  return outputDir ?? "<in-memory>";
}
