import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/shared/api";
import {
  clearCredentials,
  getCredentials,
  setCredentials,
} from "@/features/auth/credentials-storage";
import { userFixture } from "@/test/fixtures";
import { createTestQueryClient } from "@/test/utils/render-hook";
import { authKeys } from "./api/auth.keys";
import {
  clearAuthSession,
  onUnauthorizedError,
  toInternalRedirect,
} from "./session";

describe("toInternalRedirect", () => {
  it("keeps same-origin path and search", () => {
    expect(toInternalRedirect("/mailings?limit=20")).toBe("/mailings?limit=20");
  });

  it("rejects login itself", () => {
    expect(toInternalRedirect("/login")).toBeUndefined();
    expect(toInternalRedirect("/login?redirect=/mailings")).toBeUndefined();
  });

  it("rejects other origins", () => {
    expect(toInternalRedirect("https://evil.example/mailings")).toBeUndefined();
    expect(toInternalRedirect("//evil.example/mailings")).toBeUndefined();
  });

  it("rejects empty or non-string values", () => {
    expect(toInternalRedirect(undefined)).toBeUndefined();
    expect(toInternalRedirect("")).toBeUndefined();
  });
});

describe("clearAuthSession", () => {
  it("clears credentials and query cache", () => {
    const queryClient = createTestQueryClient();
    setCredentials({ email: "user@example.com", password: "password123" });
    queryClient.setQueryData(authKeys.me, userFixture);

    clearAuthSession(queryClient);

    expect(getCredentials()).toBeNull();
    expect(queryClient.getQueryData(authKeys.me)).toBeUndefined();
  });
});

describe("onUnauthorizedError", () => {
  it("clears session and navigates when 401 happens outside login", () => {
    const queryClient = createTestQueryClient();
    const navigateToLogin = vi.fn();
    setCredentials({ email: "user@example.com", password: "password123" });
    queryClient.setQueryData(authKeys.me, userFixture);

    const handled = onUnauthorizedError(
      new UnauthorizedError(),
      queryClient,
      { pathname: "/mailings", href: "/mailings?limit=20" },
      navigateToLogin,
    );

    expect(handled).toBe(true);
    expect(getCredentials()).toBeNull();
    expect(queryClient.getQueryData(authKeys.me)).toBeUndefined();
    expect(navigateToLogin).toHaveBeenCalledWith("/mailings?limit=20");
  });

  it("does not clear session for 401 on the login page", () => {
    const queryClient = createTestQueryClient();
    const navigateToLogin = vi.fn();
    setCredentials({ email: "user@example.com", password: "password123" });
    queryClient.setQueryData(authKeys.me, userFixture);

    const handled = onUnauthorizedError(
      new UnauthorizedError(),
      queryClient,
      { pathname: "/login", href: "/login" },
      navigateToLogin,
    );

    expect(handled).toBe(false);
    expect(getCredentials()).toEqual({
      email: "user@example.com",
      password: "password123",
    });
    expect(navigateToLogin).not.toHaveBeenCalled();

    clearCredentials();
  });

  it("ignores non-unauthorized errors", () => {
    const queryClient = createTestQueryClient();
    const navigateToLogin = vi.fn();
    setCredentials({ email: "user@example.com", password: "password123" });

    const handled = onUnauthorizedError(
      new Error("network"),
      queryClient,
      { pathname: "/mailings", href: "/mailings" },
      navigateToLogin,
    );

    expect(handled).toBe(false);
    expect(getCredentials()).toEqual({
      email: "user@example.com",
      password: "password123",
    });
    expect(navigateToLogin).not.toHaveBeenCalled();
  });
});
