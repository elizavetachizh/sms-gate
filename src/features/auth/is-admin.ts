import type { UserRead } from "@/shared/api";

export function isAdmin(
  user: Pick<UserRead, "role"> | null | undefined,
): boolean {
  return user?.role === "admin";
}
