import "@/test/mocks/shared-api";
import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/shared/api";
import { setCredentials } from "@/features/auth/credentials-storage";
import { meApi } from "@/test/mocks/shared-api";
import {
  createHookWrapper,
  createTestQueryClient,
  renderHook,
  waitFor,
} from "@/test/utils/render-hook";
import { userFixture } from "@/test/fixtures";
import { authKeys } from "../api/auth.keys";
import { useMe } from "./useMe";

describe("useMe", () => {
  it("does not fetch when credentials are missing", () => {
    const { result } = renderHook(() => useMe(), {
      wrapper: createHookWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(meApi.get).not.toHaveBeenCalled();
  });

  it("loads current user", async () => {
    const queryClient = createTestQueryClient();
    setCredentials({ email: "user@example.com", password: "password123" });
    vi.mocked(meApi.get).mockResolvedValue(userFixture);

    const { result } = renderHook(() => useMe(), {
      wrapper: createHookWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(meApi.get).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(userFixture);
    expect(queryClient.getQueryData(authKeys.me)).toEqual(userFixture);
  });

  it("surfaces unauthorized error", async () => {
    setCredentials({ email: "user@example.com", password: "password123" });
    vi.mocked(meApi.get).mockRejectedValue(new UnauthorizedError());

    const { result } = renderHook(() => useMe(), {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(UnauthorizedError);
  });
});
