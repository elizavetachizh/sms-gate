import "@/test/mocks/shared-api";
import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mailingsApi, providersApi } from "@/test/mocks/shared-api";
import { mailingFixture, providersListFixture } from "@/test/fixtures";
import {
  createHookWrapper,
  renderHook,
  waitFor,
} from "@/test/utils/render-hook";
import { useMailingProvider } from "./useMailingProvider";

describe("useMailingProvider", () => {
  it("initializes the draft from mailing.provider_code", async () => {
    vi.mocked(providersApi.list).mockResolvedValue(providersListFixture);

    const { result } = renderHook(
      () => useMailingProvider("mailing-1", "fake"),
      { wrapper: createHookWrapper() },
    );

    await waitFor(() => expect(result.current.isProvidersLoading).toBe(false));

    expect(result.current.providerCode).toBe("fake");
    expect(result.current.savedProviderCode).toBe("fake");
    expect(result.current.hasProviderChange).toBe(false);
    expect(providersApi.list).toHaveBeenCalledWith({ enabled_only: false });
  });

  it("keeps a saved provider that is missing from the list", async () => {
    vi.mocked(providersApi.list).mockResolvedValue({ items: [] });

    const { result } = renderHook(
      () => useMailingProvider("mailing-1", "beltelecom"),
      { wrapper: createHookWrapper() },
    );

    await waitFor(() => expect(result.current.isProvidersLoading).toBe(false));

    expect(result.current.providers).toEqual([
      {
        code: "beltelecom",
        name: "beltelecom",
        is_enabled: false,
        max_batch_size: 0,
      },
    ]);
    expect(result.current.savedProvider?.code).toBe("beltelecom");
  });

  it("syncs the draft when savedProviderCode changes", async () => {
    vi.mocked(providersApi.list).mockResolvedValue(providersListFixture);

    const { result, rerender } = renderHook(
      ({ code }: { code: string }) => useMailingProvider("mailing-1", code),
      {
        wrapper: createHookWrapper(),
        initialProps: { code: "fake" },
      },
    );

    await waitFor(() => expect(result.current.providerCode).toBe("fake"));

    rerender({ code: "beltelecom" });

    await waitFor(() => expect(result.current.providerCode).toBe("beltelecom"));
    expect(result.current.savedProviderCode).toBe("beltelecom");
  });

  it("saves the selected provider via mailing update", async () => {
    const mailing = mailingFixture({ provider_code: "beltelecom" });
    vi.mocked(providersApi.list).mockResolvedValue({
      items: [
        ...providersListFixture.items,
        {
          code: "beltelecom",
          name: "Beltelcom",
          is_enabled: true,
          max_batch_size: 50,
        },
      ],
    });
    vi.mocked(mailingsApi.update).mockResolvedValue(mailing);

    const { result } = renderHook(
      () => useMailingProvider(mailing.id, "fake"),
      { wrapper: createHookWrapper() },
    );

    await waitFor(() => expect(result.current.isProvidersLoading).toBe(false));

    act(() => {
      result.current.setProviderCode("beltelecom");
    });

    await act(async () => {
      await result.current.saveProvider();
    });

    expect(mailingsApi.update).toHaveBeenCalledWith(mailing.id, {
      provider_code: "beltelecom",
    });
  });
});
