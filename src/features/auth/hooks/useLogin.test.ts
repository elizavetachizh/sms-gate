import "@/test/mocks/shared-api";
import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/shared/api";
import { getCredentials, setCredentials } from "@/features/auth/credentials-storage";
import { meApi } from "@/test/mocks/shared-api";
import { userFixture } from "@/test/fixtures";
import {
  createHookWrapper,
  createTestQueryClient,
  renderHook,
} from "@/test/utils/render-hook";
import { authKeys } from "../api/auth.keys";
import { useLogin } from "./useLogin";

const credentials = {
  email: "user@example.com",
  password: "password123",
};

describe("useLogin", () => {
  it("probes /users/me/, saves credentials and caches the user on 200", async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(meApi.get).mockResolvedValue(userFixture);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(credentials);
    });

    expect(meApi.get).toHaveBeenCalledWith(credentials);
    expect(getCredentials()).toEqual(credentials);
    expect(queryClient.getQueryData(authKeys.me)).toEqual(userFixture);
  });

  it("does not save credentials on 401 (wrong password or inactive user)", async () => {
    vi.mocked(meApi.get).mockRejectedValue(new UnauthorizedError());

    const { result } = renderHook(() => useLogin(), {
      wrapper: createHookWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync(credentials),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    expect(meApi.get).toHaveBeenCalledWith(credentials);
    expect(getCredentials()).toBeNull();
  });

  it("clears previously stored credentials on 401", async () => {
    setCredentials({ email: "old@example.com", password: "old-password" });
    vi.mocked(meApi.get).mockRejectedValue(new UnauthorizedError());

    const { result } = renderHook(() => useLogin(), {
      wrapper: createHookWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync(credentials),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    expect(getCredentials()).toBeNull();
  });
});
