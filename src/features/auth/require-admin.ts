import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { defaultMailingsSearch } from "@/features/mailings/search";
import {
  ensureCurrentUser,
  throwUnauthorizedRedirect,
} from "./session-guards";
import { isAdmin } from "./is-admin";

export async function requireAdmin(
  queryClient: QueryClient,
  location: { href: string },
): Promise<void> {
  let me;

  try {
    me = await ensureCurrentUser(queryClient);
  } catch (error) {
    throwUnauthorizedRedirect(queryClient, error, location.href);
  }

  if (!isAdmin(me)) {
    throw redirect({ to: "/mailings", search: defaultMailingsSearch });
  }
}
