import "@/test/mocks/shared-api";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { userFixture } from "@/test/fixtures";
import { usersApi } from "@/test/mocks/shared-api";
import { createHookWrapper } from "@/test/utils/render-hook";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

describe("ChangePasswordDialog", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
    };
  });

  it("sends only the new password", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    vi.mocked(usersApi.update).mockResolvedValue(userFixture);

    render(
      <ChangePasswordDialog
        user={userFixture}
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
      { wrapper: createHookWrapper() },
    );

    await user.type(screen.getByLabelText(/Новый пароль/), "password123");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() => {
      expect(usersApi.update).toHaveBeenCalledWith(userFixture.id, {
        password: "password123",
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("rejects a short password", async () => {
    const user = userEvent.setup();
    render(
      <ChangePasswordDialog user={userFixture} open onOpenChange={vi.fn()} />,
      { wrapper: createHookWrapper() },
    );

    await user.type(screen.getByLabelText(/Новый пароль/), "short");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(await screen.findByText("Не менее 8 символов")).toBeInTheDocument();
    expect(usersApi.update).not.toHaveBeenCalled();
  });
});
