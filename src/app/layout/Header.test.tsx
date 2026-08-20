import "@/test/mocks/shared-api";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { setCredentials } from "@/features/auth/credentials-storage";
import { adminFixture, userFixture } from "@/test/fixtures";
import { meApi } from "@/test/mocks/shared-api";
import { createTestQueryClient } from "@/test/utils/render-hook";
import { Header } from "./Header";

function renderHeader() {
  const queryClient = createTestQueryClient();
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <Header />
        <Outlet />
      </>
    ),
  });
  const mailingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/mailings",
    validateSearch: () => ({ status: undefined, limit: 20, offset: 0 }),
    component: () => null,
  });
  const templatesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/templates",
    validateSearch: () => ({ limit: 20, offset: 0 }),
    component: () => null,
  });
  const providersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/providers",
    validateSearch: () => ({}),
    component: () => null,
  });
  const statsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/stats",
    component: () => null,
  });
  const usersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/users",
    validateSearch: () => ({ limit: 20, offset: 0 }),
    component: () => null,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([
      mailingsRoute,
      templatesRoute,
      providersRoute,
      statsRoute,
      usersRoute,
    ]),
    history: createMemoryHistory({ initialEntries: ["/mailings"] }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

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
