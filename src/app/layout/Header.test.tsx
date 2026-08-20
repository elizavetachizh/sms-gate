import "@/test/mocks/shared-api";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { setCredentials } from "@/features/auth/credentials-storage";
import { adminFixture, userFixture } from "@/test/fixtures";
import { meApi } from "@/test/mocks/shared-api";
import { renderHeader } from "@/test/utils/header-router";

describe("Header", () => {
  it("shows name and Users nav for admin", async () => {
    setCredentials({ email: "admin@example.com", password: "password123" });
    vi.mocked(meApi.get).mockResolvedValue(adminFixture);

    renderHeader();

    expect(await screen.findByText("Admin")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Пользователи" }),
    ).toBeInTheDocument();
  });

  it("shows email fallback and hides Users nav for a regular user", async () => {
    setCredentials({ email: "user@example.com", password: "password123" });
    vi.mocked(meApi.get).mockResolvedValue(userFixture);

    renderHeader();

    expect(await screen.findByText("user@example.com")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Пользователи" }),
    ).not.toBeInTheDocument();
  });
});
