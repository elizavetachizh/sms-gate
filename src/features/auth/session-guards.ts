import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { isUnauthorizedError, type UserRead } from "@/shared/api";
import { defaultMailingsSearch } from "@/features/mailings/search";
import { meQueryOptions } from "./api/me-query";
import { getCredentials } from "./credentials-storage";
import { clearAuthSession, toInternalRedirect } from "./session";

export async function ensureCurrentUser(
  queryClient: QueryClient,
): Promise<UserRead> {
  return queryClient.ensureQueryData(meQueryOptions);
}

export function throwUnauthorizedRedirect(
  queryClient: QueryClient,
  error: unknown,
  href: string,
): never {
  if (!isUnauthorizedError(error)) {
    throw error;
  }

  clearAuthSession(queryClient);
  throw redirect({
    to: "/login",
    search: { redirect: toInternalRedirect(href) },
  });
}

export async function bounceIfAuthenticated(
  queryClient: QueryClient,
): Promise<void> {
  if (!getCredentials()) {
    return;
  }

  try {
    await queryClient.fetchQuery({
      ...meQueryOptions,
      staleTime: 0,
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      clearAuthSession(queryClient);
      return;
    }
    throw error;
  }

  throw redirect({ to: "/mailings", search: defaultMailingsSearch });
}
