import type { ResolvedBackendInfo } from "../types.js";

export interface RuntimeLauncher {
  canLaunch(): Promise<boolean>;
  launch(): Promise<ResolvedBackendInfo>;
  shutdown(): Promise<void>;
}
