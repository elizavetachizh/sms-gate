import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { providersListFixture } from "@/test/fixtures";
import { ProviderCard } from "./ProviderCard";

const provider = providersListFixture.items[0];
const onUpdate = vi.fn();

function renderCard(canEdit: boolean) {
  return render(
    <ProviderCard
      provider={provider}
      canEdit={canEdit}
      isUpdating={false}
      updatingCode={null}
      onUpdate={onUpdate}
    />,
  );
}

describe("ProviderCard", () => {
  it("shows name editor and enabled toggle for admin", () => {
    renderCard(true);

    expect(screen.getByLabelText("Отображаемое имя")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Сохранить имя" }),
    ).toBeInTheDocument();
  });

  it("hides provider edits for a regular user", () => {
    renderCard(false);

    expect(screen.getByText("Fake provider")).toBeInTheDocument();
    expect(screen.getByText("Включён")).toBeInTheDocument();
    expect(screen.queryByLabelText("Отображаемое имя")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Сохранить имя" }),
    ).not.toBeInTheDocument();
  });
});
