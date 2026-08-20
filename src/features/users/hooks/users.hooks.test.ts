import "@/test/mocks/shared-api";
import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usersApi } from "@/test/mocks/shared-api";
import {
  createHookWrapper,
  createTestQueryClient,
  renderHook,
  waitFor,
} from "@/test/utils/render-hook";
import { userFixture, usersPageFixture } from "@/test/fixtures";
import { userKeys } from "../api/users.keys";
import { useCreateUser } from "./useCreateUser";
import { useUpdateUser } from "./useUpdateUser";
import { useUsersList } from "./useUsersList";

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
});
