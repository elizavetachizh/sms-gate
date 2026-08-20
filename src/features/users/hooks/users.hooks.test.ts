import "@/test/mocks/shared-api";
import { QueryClient } from "@tanstack/react-query";
import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { authKeys } from "@/features/auth/api/auth.keys";
import {
  getCredentials,
  setCredentials,
} from "@/features/auth/credentials-storage";
import { usersApi } from "@/test/mocks/shared-api";
import {
  createHookWrapper,
  createTestQueryClient,
  renderHook,
  waitFor,
} from "@/test/utils/render-hook";
import { adminFixture, userFixture, usersPageFixture } from "@/test/fixtures";
import { userKeys } from "../api/users.keys";
import { useCreateUser } from "./useCreateUser";
import { useUpdateUser } from "./useUpdateUser";
import { useUsersList } from "./useUsersList";

function createPersistentQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

describe("useUsersList", () => {
  it("loads users page", async () => {
    const params = { limit: 20, offset: 0 };
    const page = usersPageFixture();
    vi.mocked(usersApi.list).mockResolvedValue(page);

    const { result } = renderHook(() => useUsersList(params), {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(usersApi.list).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(page);
  });
});

describe("useCreateUser", () => {
  it("creates a user and invalidates the list", async () => {
    const queryClient = createTestQueryClient();
    const payload = {
      email: "new@example.com",
      password: "password123",
      name: "New",
      role: "user" as const,
      is_active: true,
    };
    const created = {
      ...userFixture,
      id: "new-user-id",
      email: payload.email,
      name: payload.name,
      role: payload.role,
      is_active: payload.is_active,
    };
    vi.mocked(usersApi.create).mockResolvedValue(created);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(usersApi.create).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: userKeys.lists() });
  });
});

describe("useUpdateUser", () => {
  it("updates a user and invalidates the list", async () => {
    const queryClient = createTestQueryClient();
    const payload = { role: "admin" as const };
    const updated = { ...userFixture, ...payload };
    vi.mocked(usersApi.update).mockResolvedValue(updated);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateUser(userFixture.id), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(usersApi.update).toHaveBeenCalledWith(userFixture.id, payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: userKeys.lists() });
  });

  it("updates cached me and stored credentials when editing yourself", async () => {
    const queryClient = createPersistentQueryClient();
    const stored = { email: adminFixture.email, password: "password123" };
    setCredentials(stored);
    queryClient.setQueryData(authKeys.me, adminFixture);

    const payload = {
      email: "new-admin@example.com",
      password: "new-password-1",
    };
    const updated = { ...adminFixture, email: payload.email };
    vi.mocked(usersApi.update).mockResolvedValue(updated);

    const { result } = renderHook(() => useUpdateUser(adminFixture.id), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(queryClient.getQueryData(authKeys.me)).toEqual(updated);
    expect(getCredentials()).toEqual({
      email: payload.email,
      password: payload.password,
    });
  });

  it("does not touch stored credentials when editing another user", async () => {
    const queryClient = createPersistentQueryClient();
    const stored = { email: adminFixture.email, password: "password123" };
    setCredentials(stored);
    queryClient.setQueryData(authKeys.me, adminFixture);

    const payload = { email: "other@example.com" };
    const updated = { ...userFixture, ...payload };
    vi.mocked(usersApi.update).mockResolvedValue(updated);

    const { result } = renderHook(() => useUpdateUser(userFixture.id), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(queryClient.getQueryData(authKeys.me)).toEqual(adminFixture);
    expect(getCredentials()).toEqual(stored);
  });
});
