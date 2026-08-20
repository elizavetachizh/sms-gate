import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { adminFixture, userFixture } from "@/test/fixtures";
import { UsersTable } from "./UsersTable";

describe("UsersTable", () => {
  it("renders name, email, role, status and an edit action", async () => {
    const onEdit = vi.fn();
    const onChangePassword = vi.fn();
    const user = userEvent.setup();
    const namedUser = { ...userFixture, name: "Иван" };

    render(
      <UsersTable
        users={[namedUser, adminFixture]}
        onEdit={onEdit}
        onChangePassword={onChangePassword}
      />,
    );

    expect(screen.getByText("Иван")).toBeInTheDocument();
    expect(screen.getByText(userFixture.email)).toBeInTheDocument();
    expect(screen.getByText("Пользователь")).toBeInTheDocument();
    expect(screen.getByText("Администратор")).toBeInTheDocument();
    expect(screen.getAllByText("Активен")).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: /удалить/i }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getAllByRole("button", { name: "Изменить пользователя" })[0],
    );

    expect(onEdit).toHaveBeenCalledWith(namedUser);
  });

  it("opens change password from the row action", async () => {
    const onChangePassword = vi.fn();
    const user = userEvent.setup();

    render(
      <UsersTable
        users={[userFixture]}
        onEdit={vi.fn()}
        onChangePassword={onChangePassword}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Сменить пароль" }));

    expect(onChangePassword).toHaveBeenCalledWith(userFixture);
  });

  it("shows a dash when the name is empty", () => {
    render(
      <UsersTable
        users={[userFixture]}
        onEdit={vi.fn()}
        onChangePassword={vi.fn()}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows inactive status", () => {
    render(
      <UsersTable
        users={[{ ...userFixture, is_active: false }]}
        onEdit={vi.fn()}
        onChangePassword={vi.fn()}
      />,
    );

    expect(screen.getByText("Неактивен")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(
      <UsersTable users={[]} onEdit={vi.fn()} onChangePassword={vi.fn()} />,
    );

    expect(screen.getByText("Пользователи не найдены")).toBeInTheDocument();
  });
});
