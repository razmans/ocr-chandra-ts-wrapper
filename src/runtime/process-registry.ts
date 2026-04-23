export type OwnedRuntimeInfo = {
  pid?: number;
  containerId?: string;
  type?: "python" | "docker";
};

export class ProcessRegistry {
  private ownedRuntime: OwnedRuntimeInfo | null = null;

  set(runtime: OwnedRuntimeInfo): void {
    this.ownedRuntime = runtime;
  }

  get(): OwnedRuntimeInfo | null {
    return this.ownedRuntime;
  }

  clear(): void {
    this.ownedRuntime = null;
  }
}
