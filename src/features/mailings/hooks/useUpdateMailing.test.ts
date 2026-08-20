import "@/test/mocks/shared-api";
import { describe, expect, it, vi } from "vitest";
import { act } from "@testing-library/react";
import { mailingsApi } from "@/test/mocks/shared-api";
import {
  createHookWrapper,
  createTestQueryClient,
  renderHook,
} from "@/test/utils/render-hook";
import { mailingFixture } from "@/test/fixtures";
import { mailingKeys } from "../api/mailings.keys";
import { useUpdateMailing } from "./useUpdateMailing";

describe("useUpdateMailing", () => {
  it("updates provider without messages key", async () => {
    const queryClient = createTestQueryClient();
    const mailing = mailingFixture();
    vi.mocked(mailingsApi.update).mockResolvedValue(mailing);

    const { result } = renderHook(() => useUpdateMailing(mailing.id), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await result.current.updateProvider("fake");
    });

    expect(mailingsApi.update).toHaveBeenCalledWith(mailing.id, {
      provider_code: "fake",
    });
  });

  it("updates send_on without messages key", async () => {
    const queryClient = createTestQueryClient();
    const mailing = mailingFixture();
    vi.mocked(mailingsApi.update).mockResolvedValue(mailing);

    const { result } = renderHook(() => useUpdateMailing(mailing.id), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await result.current.updateSendOn(
        "fake",
        mailing.name,
        "2026-08-20T12:30:00.000Z",
      );
    });

    expect(mailingsApi.update).toHaveBeenCalledWith(mailing.id, {
      provider_code: "fake",
      name: mailing.name,
      send_on: "2026-08-20T12:30:00.000Z",
    });
  });

  it("replaces messages with full array", async () => {
    const queryClient = createTestQueryClient();
    const mailing = mailingFixture();
    const messages = [{ msisdn: "375291112233", text: "new text" }];
    vi.mocked(mailingsApi.update).mockResolvedValue(mailing);

    const { result } = renderHook(() => useUpdateMailing(mailing.id), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await result.current.replaceMessages("fake", messages);
    });

    expect(mailingsApi.update).toHaveBeenCalledWith(mailing.id, {
      provider_code: "fake",
      messages,
    });
  });

  it("updates detail cache on success", async () => {
    const queryClient = createTestQueryClient();
    const mailing = mailingFixture();
    vi.mocked(mailingsApi.update).mockResolvedValue(mailing);

    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

    const { result } = renderHook(() => useUpdateMailing(mailing.id), {
      wrapper: createHookWrapper(queryClient),
    });

    await act(async () => {
      await result.current.updateProvider("fake");
    });

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      mailingKeys.detail(mailing.id),
      mailing,
    );
  });
});
