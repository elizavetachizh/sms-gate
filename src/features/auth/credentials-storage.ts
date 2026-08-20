import { getCredentials } from "@/shared/api/config.ts";

export {
  clearCredentials,
  getCredentials,
  setCredentials,
} from "@/shared/api/config.ts";
export type { BasicCredentials } from "@/shared/api/types.ts";

export function hasCredentials(): boolean {
  return getCredentials() !== null;
}
