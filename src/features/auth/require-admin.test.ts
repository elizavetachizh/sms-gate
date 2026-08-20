import "@/test/mocks/shared-api";
import { isRedirect } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/shared/api";
import { meApi } from "@/test/mocks/shared-api";
import { adminFixture, userFixture } from "@/test/fixtures";
import { defaultMailingsSearch } from "@/features/mailings/search";
import {
  getCredentials,
  setCredentials,
} from "@/features/auth/credentials-storage";
import { createTestQueryClient } from "@/test/utils/render-hook";
import { authKeys } from "./api/auth.keys";
import { requireAdmin } from "./require-admin";

const usersHref = "/users?limit=20";

describe("requireAdmin", () => {
  it("allows an admin through", async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(meApi.get).mockResolvedValue(adminFixture);

    await expect(
      requireAdmin(queryClient, { href: usersHref }),
    ).resolves.toBeUndefined();
    expect(queryClient.getQueryData(authKeys.me)).toEqual(adminFixture);
  });

  it("reuses cached me instead of fetching again", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(authKeys.me, adminFixture);

    await expect(
      requireAdmin(queryClient, { href: usersHref }),
    ).resolves.toBeUndefined();
    expect(meApi.get).not.toHaveBeenCalled();
  });

  it("redirects a regular user to mailings", async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(meApi.get).mockResolvedValue(userFixture);

    try {
      await requireAdmin(queryClient, { href: usersHref });
      throw new Error("expected redirect");
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect(error).toMatchObject({
        options: {
          to: "/mailings",
          search: defaultMailingsSearch,
        },
      });
    }
  });

  it("clears the session and redirects to login on 401", async () => {
    const queryClient = createTestQueryClient();
    setCredentials({ email: "admin@example.com", password: "password123" });
    vi.mocked(meApi.get).mockRejectedValue(new UnauthorizedError());

    try {
      await requireAdmin(queryClient, { href: usersHref });
      throw new Error("expected redirect");
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect(error).toMatchObject({
        options: {
          to: "/login",
          search: { redirect: usersHref },
        },
      });
    }

    expect(getCredentials()).toBeNull();
    expect(queryClient.getQueryData(authKeys.me)).toBeUndefined();
  });
});
