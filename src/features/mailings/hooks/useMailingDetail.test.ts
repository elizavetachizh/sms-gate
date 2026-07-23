import "@/test/mocks/shared-api";
import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mailingsApi } from "@/test/mocks/shared-api";
import {
  createHookWrapper,
  renderHook,
  waitFor,
} from "@/test/utils/render-hook";
import { mailingFixture, messageFixture } from "@/test/fixtures";
import { useMailingDetail } from "./useMailingDetail";

describe("useMailingDetail", () => {
  it("loads mailing by id", async () => {
    const mailingId = "660e8400-e29b-41d4-a716-446655440001";
    const mailing = mailingFixture({ id: mailingId });
    vi.mocked(mailingsApi.getById).mockResolvedValue(mailing);

    const { result } = renderHook(() => useMailingDetail(mailingId), {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mailingsApi.getById).toHaveBeenCalledWith(mailingId);
    expect(result.current.data).toEqual(mailing);
  });

  describe("polling", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("polls while messages are pending", async () => {
      const mailingId = "660e8400-e29b-41d4-a716-446655440001";
      const pendingMailing = mailingFixture({
        id: mailingId,
        status: "queued",
        messages: [messageFixture({ status: "queued" })],
      });
      vi.mocked(mailingsApi.getById).mockResolvedValue(pendingMailing);

      renderHook(() => useMailingDetail(mailingId), {
        wrapper: createHookWrapper(),
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(mailingsApi.getById).toHaveBeenCalledTimes(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3_000);
      });

      expect(mailingsApi.getById).toHaveBeenCalledTimes(2);
    });

    it("does not poll when mailing is still created", async () => {
      const mailingId = "660e8400-e29b-41d4-a716-446655440001";
      vi.mocked(mailingsApi.getById).mockResolvedValue(
        mailingFixture({ id: mailingId, status: "created" }),
      );

      renderHook(() => useMailingDetail(mailingId), {
        wrapper: createHookWrapper(),
      });

      await act(async () => {
        await Promise.resolve();
        await vi.advanceTimersByTimeAsync(6_000);
      });

      expect(mailingsApi.getById).toHaveBeenCalledTimes(1);
    });
  });
});
