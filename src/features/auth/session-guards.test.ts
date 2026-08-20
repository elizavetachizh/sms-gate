import "@/test/mocks/shared-api";
import { isRedirect } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/shared/api";
import { meApi } from "@/test/mocks/shared-api";
import { userFixture } from "@/test/fixtures";
import { defaultMailingsSearch } from "@/features/mailings/search";
import {
  getCredentials,
  setCredentials,
} from "@/features/auth/credentials-storage";
import { createTestQueryClient } from "@/test/utils/render-hook";
import { authKeys } from "./api/auth.keys";
import {
  bounceIfAuthenticated,
  ensureCurrentUser,
  throwUnauthorizedRedirect,
} from "./session-guards";

const credentials = {
  email: "user@example.com",
  password: "password123",
};

describe("ensureCurrentUser", () => {
  it("loads me into the query cache", async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(meApi.get).mockResolvedValue(userFixture);

    await expect(ensureCurrentUser(queryClient)).resolves.toEqual(userFixture);
    expect(queryClient.getQueryData(authKeys.me)).toEqual(userFixture);
  });
});

describe("throwUnauthorizedRedirect", () => {
  it("clears the session and redirects to login with a return URL", () => {
    const queryClient = createTestQueryClient();
    setCredentials(credentials);
    queryClient.setQueryData(authKeys.me, userFixture);

    try {
      throwUnauthorizedRedirect(
        queryClient,
        new UnauthorizedError(),
        "/mailings?limit=20",
      );
      throw new Error("expected redirect");
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect(error).toMatchObject({
        options: {
          to: "/login",
          search: { redirect: "/mailings?limit=20" },
        },
      });
    }

    expect(getCredentials()).toBeNull();
    expect(queryClient.getQueryData(authKeys.me)).toBeUndefined();
  });

  it("rethrows non-401 errors without clearing the session", () => {
    const queryClient = createTestQueryClient();
    setCredentials(credentials);
    const error = new Error("network");

    expect(() =>
      throwUnauthorizedRedirect(queryClient, error, "/mailings"),
    ).toThrow(error);
    expect(getCredentials()).toEqual(credentials);
  });
});

describe("bounceIfAuthenticated", () => {
  it("does nothing when credentials are missing", async () => {
    const queryClient = createTestQueryClient();

    await expect(bounceIfAuthenticated(queryClient)).resolves.toBeUndefined();
    expect(meApi.get).not.toHaveBeenCalled();
  });

  it("redirects a valid session to mailings", async () => {
    const queryClient = createTestQueryClient();
    setCredentials(credentials);
    vi.mocked(meApi.get).mockResolvedValue(userFixture);

    try {
      await bounceIfAuthenticated(queryClient);
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

  it("clears a stale blob and stays on login even if me is cached", async () => {
    const queryClient = createTestQueryClient();
    setCredentials(credentials);
    queryClient.setQueryData(authKeys.me, userFixture);
    vi.mocked(meApi.get).mockRejectedValue(new UnauthorizedError());

    await expect(bounceIfAuthenticated(queryClient)).resolves.toBeUndefined();
    expect(getCredentials()).toBeNull();
    expect(queryClient.getQueryData(authKeys.me)).toBeUndefined();
  });
});
