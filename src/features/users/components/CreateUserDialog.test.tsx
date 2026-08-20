import "@/test/mocks/shared-api";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ConflictError, ForbiddenError } from "@/shared/api";
import { userFixture } from "@/test/fixtures";
import { usersApi } from "@/test/mocks/shared-api";
import { createHookWrapper } from "@/test/utils/render-hook";
import { CreateUserDialog } from "./CreateUserDialog";

describe("CreateUserDialog", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
    };
  });

  it("creates a user with required fields", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const created = {
      ...userFixture,
      id: "new-user-id",
      email: "new@example.com",
      name: "New",
    };
    vi.mocked(usersApi.create).mockResolvedValue(created);

    render(
      <CreateUserDialog
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
      { wrapper: createHookWrapper() },
    );

    await user.type(screen.getByLabelText(/Email/), "new@example.com");
    await user.type(screen.getByLabelText(/Пароль/), "password123");
    await user.type(screen.getByLabelText(/Имя/), "New");
    await user.click(screen.getByRole("button", { name: "Создать" }));

    await waitFor(() => {
      expect(usersApi.create).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
        name: "New",
        role: "user",
        is_active: true,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("shows a localized conflict error", async () => {
    const user = userEvent.setup();
    vi.mocked(usersApi.create).mockRejectedValue(
      new ConflictError("Email already exists"),
    );

    render(<CreateUserDialog open onOpenChange={vi.fn()} />, {
      wrapper: createHookWrapper(),
    });

    await user.type(screen.getByLabelText(/Email/), "new@example.com");
    await user.type(screen.getByLabelText(/Пароль/), "password123");
    await user.click(screen.getByRole("button", { name: "Создать" }));

    expect(
      await screen.findByText("Пользователь с таким email уже существует"),
    ).toBeInTheDocument();
  });

  it("shows a forbidden error", async () => {
    const user = userEvent.setup();
    vi.mocked(usersApi.create).mockRejectedValue(new ForbiddenError());

    render(<CreateUserDialog open onOpenChange={vi.fn()} />, {
      wrapper: createHookWrapper(),
    });

    await user.type(screen.getByLabelText(/Email/), "new@example.com");
    await user.type(screen.getByLabelText(/Пароль/), "password123");
    await user.click(screen.getByRole("button", { name: "Создать" }));

    expect(
      await screen.findByText("Недостаточно прав для этого действия"),
    ).toBeInTheDocument();
  });
});
