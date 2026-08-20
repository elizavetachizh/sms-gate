import "@/test/mocks/shared-api";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { messageFixture, templatesPageFixture } from "@/test/fixtures";
import { messagesApi, servicesApi, templatesApi } from "@/test/mocks/shared-api";
import { createHookWrapper } from "@/test/utils/render-hook";
import { CreateMessageDialog } from "./CreateMessageDialog";

describe("CreateMessageDialog", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
    };
  });

  it("adds messages without requiring mailing name", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const created = messageFixture({ msisdn: "375291234567", text: "Привет!" });

    vi.mocked(templatesApi.list).mockResolvedValue(templatesPageFixture([]));
    vi.mocked(servicesApi.analyzeText).mockResolvedValue({
      encoding: "gsm7",
      characters: 7,
      units: 1,
      segments: 1,
      capacity: 160,
      remaining: 153,
      per_segment_limit: 160,
      is_concatenated: false,
      non_gsm_characters: [],
    });
    vi.mocked(messagesApi.create).mockResolvedValue(created);

    render(
      <CreateMessageDialog
        mailingId="mailing-1"
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
      { wrapper: createHookWrapper() },
    );

    await user.type(screen.getByLabelText("Текст SMS"), "Привет!");
    await user.type(screen.getByLabelText("Номер 1"), "291234567");
    await user.click(screen.getByRole("button", { name: "Добавить" }));

    await waitFor(() => {
      expect(messagesApi.create).toHaveBeenCalledWith("mailing-1", {
        msisdn: "375291234567",
        text: "Привет!",
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalledWith(1);
  });
});
