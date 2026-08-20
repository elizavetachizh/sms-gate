import "@/test/mocks/shared-api";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ConflictError } from "@/shared/api";
import { userFixture } from "@/test/fixtures";
import { usersApi } from "@/test/mocks/shared-api";
import { createHookWrapper } from "@/test/utils/render-hook";
import { EditUserDialog } from "./EditUserDialog";

describe("EditUserDialog", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
    };
  });

  it("disables save until the form is dirty", () => {
    render(
      <EditUserDialog user={userFixture} open onOpenChange={vi.fn()} />,
      { wrapper: createHookWrapper() },
    );

    expect(screen.getByRole("button", { name: "Сохранить" })).toBeDisabled();
  });

  it("sends only changed fields on PATCH", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const updated = { ...userFixture, name: "Updated" };
    vi.mocked(usersApi.update).mockResolvedValue(updated);

    render(
      <EditUserDialog
        user={userFixture}
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
      { wrapper: createHookWrapper() },
    );

    await user.type(screen.getByLabelText(/Имя/), "Updated");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() => {
      expect(usersApi.update).toHaveBeenCalledWith(userFixture.id, {
        name: "Updated",
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("deactivates a user through PATCH instead of delete", async () => {
    const user = userEvent.setup();
    vi.mocked(usersApi.update).mockResolvedValue({
      ...userFixture,
      is_active: false,
    });

    render(
      <EditUserDialog user={userFixture} open onOpenChange={vi.fn()} />,
      { wrapper: createHookWrapper() },
    );

    await user.click(screen.getByLabelText("Активен"));
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() => {
      expect(usersApi.update).toHaveBeenCalledWith(userFixture.id, {
        is_active: false,
      });
    });
    expect(usersApi.update).not.toHaveBeenCalledWith(
      userFixture.id,
      expect.objectContaining({ password: expect.anything() }),
    );
  });

  it("shows a localized error when deactivating the last admin", async () => {
    const user = userEvent.setup();
    vi.mocked(usersApi.update).mockRejectedValue(
      new ConflictError("Cannot demote or deactivate the last active admin"),
    );

    render(
      <EditUserDialog user={userFixture} open onOpenChange={vi.fn()} />,
      { wrapper: createHookWrapper() },
    );

    await user.click(screen.getByLabelText("Активен"));
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(
      await screen.findByText(
        "Нельзя понизить или деактивировать последнего активного администратора",
      ),
    ).toBeInTheDocument();
  });
});
