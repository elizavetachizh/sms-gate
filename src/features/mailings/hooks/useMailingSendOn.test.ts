import "@/test/mocks/shared-api";
import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mailingsApi } from "@/test/mocks/shared-api";
import { mailingFixture } from "@/test/fixtures";
import { createHookWrapper, renderHook } from "@/test/utils/render-hook";
import { toDatetimeLocalValue } from "../lib/send-on";
import { useMailingSendOn } from "./useMailingSendOn";

describe("useMailingSendOn", () => {
  it("initializes the draft from mailing.send_on", () => {
    const iso = "2026-08-20T12:30:00.000Z";
    const mailing = mailingFixture({ send_on: iso });

    const { result } = renderHook(
      () =>
        useMailingSendOn(
          mailing.id,
          mailing.provider_code,
          mailing.name,
          mailing.send_on,
        ),
      { wrapper: createHookWrapper() },
    );

    expect(result.current.sendOn).toBe(toDatetimeLocalValue(iso));
    expect(result.current.savedIso).toBe(iso);
    expect(result.current.hasChange).toBe(false);
  });

  it("fills the draft when send_on arrives after the mailing loads", () => {
    const iso = "2026-08-20T12:30:00.000Z";
    const mailing = mailingFixture({ send_on: iso });

    const { result, rerender } = renderHook(
      ({ sendOn }: { sendOn: string | null }) =>
        useMailingSendOn(
          mailing.id,
          mailing.provider_code,
          mailing.name,
          sendOn,
        ),
      {
        wrapper: createHookWrapper(),
        initialProps: { sendOn: null },
      },
    );

    expect(result.current.sendOn).toBe("");

    rerender({ sendOn: iso });

    expect(result.current.sendOn).toBe(toDatetimeLocalValue(iso));
    expect(result.current.hasChange).toBe(false);
  });

  it("keeps an unsaved draft when the saved send_on updates", () => {
    const mailing = mailingFixture({ send_on: "2026-08-20T12:30:00.000Z" });

    const { result, rerender } = renderHook(
      ({ sendOn }: { sendOn: string | null }) =>
        useMailingSendOn(
          mailing.id,
          mailing.provider_code,
          mailing.name,
          sendOn,
        ),
      {
        wrapper: createHookWrapper(),
        initialProps: { sendOn: mailing.send_on },
      },
    );

    act(() => {
      result.current.setSendOn("2026-08-21T09:00");
    });

    rerender({ sendOn: "2026-08-20T14:00:00.000Z" });

    expect(result.current.sendOn).toBe("2026-08-21T09:00");
    expect(result.current.hasChange).toBe(true);
  });

  it("saves send_on on the mailing without replacing messages", async () => {
    const mailing = mailingFixture({ send_on: null });
    vi.mocked(mailingsApi.update).mockResolvedValue(mailing);

    const { result } = renderHook(
      () =>
        useMailingSendOn(
          mailing.id,
          mailing.provider_code,
          mailing.name,
          mailing.send_on,
        ),
      { wrapper: createHookWrapper() },
    );

    act(() => {
      result.current.setSendOn("2026-08-20T15:30");
    });

    await act(async () => {
      await result.current.saveSendOn();
    });

    expect(mailingsApi.update).toHaveBeenCalledWith(mailing.id, {
      provider_code: mailing.provider_code,
      name: mailing.name,
      send_on: new Date("2026-08-20T15:30").toISOString(),
    });
  });

  it("can save when the mailing has no messages", async () => {
    const mailing = mailingFixture({ messages: [], send_on: null });
    vi.mocked(mailingsApi.update).mockResolvedValue(mailing);

    const { result } = renderHook(
      () =>
        useMailingSendOn(
          mailing.id,
          mailing.provider_code,
          mailing.name,
          mailing.send_on,
        ),
      { wrapper: createHookWrapper() },
    );

    act(() => {
      result.current.setSendOn("2026-08-20T15:30");
    });

    expect(result.current.canSave).toBe(true);

    await act(async () => {
      await result.current.saveSendOn();
    });

    expect(mailingsApi.update).toHaveBeenCalledOnce();
  });
});
