import "@/test/mocks/shared-api";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { setCredentials } from "@/features/auth/credentials-storage";
import { adminFixture, providersListFixture, userFixture } from "@/test/fixtures";
import { meApi } from "@/test/mocks/shared-api";
import { createHookWrapper } from "@/test/utils/render-hook";
import { ProviderCard } from "./ProviderCard";

const provider = providersListFixture.items[0];
const onUpdate = vi.fn();

function renderCard() {
  return render(
    <ProviderCard
      provider={provider}
      isUpdating={false}
      updatingCode={null}
      onUpdate={onUpdate}
    />,
    { wrapper: createHookWrapper() },
  );
}

describe("ProviderCard", () => {
  it("shows name editor and enabled toggle for admin", async () => {
    setCredentials({ email: "admin@example.com", password: "password123" });
    vi.mocked(meApi.get).mockResolvedValue(adminFixture);

    renderCard();

    expect(await screen.findByLabelText("Отображаемое имя")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Сохранить имя" })).toBeInTheDocument();
  });

  it("hides provider edits for a regular user", async () => {
    setCredentials({ email: "user@example.com", password: "password123" });
    vi.mocked(meApi.get).mockResolvedValue(userFixture);

    renderCard();

    expect(await screen.findByText("Fake provider")).toBeInTheDocument();
    expect(screen.getByText("Включён")).toBeInTheDocument();
    expect(screen.queryByLabelText("Отображаемое имя")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Сохранить имя" }),
    ).not.toBeInTheDocument();
  });
});
