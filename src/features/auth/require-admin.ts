import { redirect } from "@tanstack/react-router";
import { isUnauthorizedError, meApi } from "@/shared/api";
import { defaultMailingsSearch } from "@/features/mailings/search";
import { isAdmin } from "./is-admin";
import { defaultLoginSearch } from "./search";

export async function requireAdmin(): Promise<void> {
  let me;

  try {
    me = await meApi.get();
  } catch (error) {
    if (isUnauthorizedError(error)) {
      throw redirect({ to: "/login", search: defaultLoginSearch });
    }
    throw error;
  }

  if (!isAdmin(me)) {
    throw redirect({ to: "/mailings", search: defaultMailingsSearch });
  }
}
