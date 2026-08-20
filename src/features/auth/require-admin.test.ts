import "@/test/mocks/shared-api";
import { isRedirect } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/shared/api";
import { meApi } from "@/test/mocks/shared-api";
import { adminFixture, userFixture } from "@/test/fixtures";
import { defaultMailingsSearch } from "@/features/mailings/search";
import { requireAdmin } from "./require-admin";
import { defaultLoginSearch } from "./search";

describe("requireAdmin", () => {
  it("allows an admin through", async () => {
    vi.mocked(meApi.get).mockResolvedValue(adminFixture);

    await expect(requireAdmin()).resolves.toBeUndefined();
  });

  it("redirects a regular user to mailings", async () => {
    vi.mocked(meApi.get).mockResolvedValue(userFixture);

    try {
      await requireAdmin();
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

  it("redirects to login on 401", async () => {
    vi.mocked(meApi.get).mockRejectedValue(new UnauthorizedError());

    try {
      await requireAdmin();
      throw new Error("expected redirect");
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect(error).toMatchObject({
        options: {
          to: "/login",
          search: defaultLoginSearch,
        },
      });
    }
  });
});
