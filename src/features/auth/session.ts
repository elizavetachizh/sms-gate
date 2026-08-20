import type { QueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/shared/api";
import { clearCredentials } from "./credentials-storage";

export const LOGIN_PATH = "/login";

export function clearAuthSession(queryClient: QueryClient): void {
  clearCredentials();
  queryClient.clear();
}

export function toInternalRedirect(value: unknown): string | undefined {
  if (typeof value !== "string" || value === "") {
    return undefined;
  }

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) {
      return undefined;
    }

    if (url.pathname === LOGIN_PATH) {
      return undefined;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
}

export function onUnauthorizedError(
  error: unknown,
  queryClient: QueryClient,
  location: { pathname: string; href: string },
  navigateToLogin: (redirectHref: string) => void,
): boolean {
  if (!isUnauthorizedError(error)) {
    return false;
  }

  if (location.pathname === LOGIN_PATH) {
    return false;
  }

  clearAuthSession(queryClient);
  navigateToLogin(location.href);
  return true;
}
