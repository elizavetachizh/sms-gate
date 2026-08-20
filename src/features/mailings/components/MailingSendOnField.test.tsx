import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MailingSendOnField } from "./MailingSendOnField";

const baseState = {
  sendOn: "",
  setSendOn: vi.fn(),
  savedIso: null as string | null,
  mixed: false,
  hasChange: false,
  canSave: false,
  isSaving: false,
  saveSendOn: vi.fn(),
};

describe("MailingSendOnField", () => {
  it("shows an editor when the mailing can be edited", () => {
    render(
      <MailingSendOnField
        canEdit
        sendOnState={{ ...baseState, canSave: true, hasChange: true }}
      />,
    );

    expect(screen.getByLabelText("Дата и время отправки")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Сохранить" })).toBeEnabled();
  });

  it("shows a read-only fallback when send_on is empty", () => {
    render(<MailingSendOnField canEdit={false} sendOnState={baseState} />);

    expect(screen.getByText("Сразу (текущее UTC)")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Сохранить" }),
    ).not.toBeInTheDocument();
  });

  it("saves on click", async () => {
    const user = userEvent.setup();
    const saveSendOn = vi.fn().mockResolvedValue(undefined);
    const onUpdated = vi.fn();

    render(
      <MailingSendOnField
        canEdit
        sendOnState={{
          ...baseState,
          canSave: true,
          hasChange: true,
          saveSendOn,
        }}
        onUpdated={onUpdated}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(saveSendOn).toHaveBeenCalled();
    expect(onUpdated).toHaveBeenCalled();
  });
});
