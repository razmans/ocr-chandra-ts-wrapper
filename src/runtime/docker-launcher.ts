import { ChandraError } from "../errors.js";
import type { RuntimeLauncher } from "./launcher.js";
import type { ResolvedBackendInfo } from "../types.js";

export class DockerLauncher implements RuntimeLauncher {
  async canLaunch(): Promise<boolean> {
    return false;
  }

  async launch(): Promise<ResolvedBackendInfo> {
    throw new ChandraError("DOCKER_NOT_FOUND", "Docker launcher is scaffolded but not implemented yet.");
  }

  async shutdown(): Promise<void> {
    return;
  }
}
