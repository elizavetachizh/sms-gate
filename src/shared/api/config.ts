import { z } from "zod";
import type { BasicCredentials } from "./types.ts";

const CREDENTIALS_STORAGE_KEY = "sms-gate-credentials";

const credentialsSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
}

export function getCredentials(): BasicCredentials | null {
  const raw = sessionStorage.getItem(CREDENTIALS_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = credentialsSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      clearCredentials();
      return null;
    }

    return parsed.data;
  } catch {
    clearCredentials();
    return null;
  }
}

export function setCredentials(credentials: BasicCredentials): void {
  sessionStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials));
}

export function clearCredentials(): void {
  sessionStorage.removeItem(CREDENTIALS_STORAGE_KEY);
}
