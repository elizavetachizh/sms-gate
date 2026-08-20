import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  type AnyRoute,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { defaultMailingsSearch } from "@/features/mailings/search";
import { RouteError, RouteNotFound } from "./route-fallbacks";

function renderRouter(initialPath: string, routeTree: AnyRoute) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    defaultNotFoundComponent: RouteNotFound,
    defaultErrorComponent: RouteError,
  });

  return render(<RouterProvider router={router} />);
}

describe("RouteNotFound", () => {
  it("renders a 404 screen with a link to mailings", async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
      notFoundComponent: RouteNotFound,
    });
    const mailingsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/mailings",
      validateSearch: () => defaultMailingsSearch,
      component: () => <p>Список рассылок</p>,
    });
    const unmatchedRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "$",
      component: RouteNotFound,
    });

    renderRouter(
      "/unknown-page",
      rootRoute.addChildren([mailingsRoute, unmatchedRoute]),
    );

    expect(
      await screen.findByRole("heading", { name: "Страница не найдена" }),
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "К рассылкам" });
    expect(link.getAttribute("href")).toContain("/mailings");
  });
});

describe("RouteError", () => {
  it("renders the error and can go back to mailings", async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
      errorComponent: RouteError,
    });
    const mailingsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/mailings",
      validateSearch: () => defaultMailingsSearch,
      component: () => <p>Список рассылок</p>,
    });
    const boomRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/boom",
      component: () => {
        throw new Error("Тестовая авария");
      },
    });

    renderRouter(
      "/boom",
      rootRoute.addChildren([mailingsRoute, boomRoute]),
    );

    expect(
      await screen.findByText("Не удалось открыть страницу"),
    ).toBeInTheDocument();
    expect(screen.getByText("Тестовая авария")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Повторить" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "К рассылкам" }).getAttribute("href")).toContain(
      "/mailings",
    );
  });

  it("retries the route when reset is pressed", async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    const rootRoute = createRootRoute({
      component: () => <Outlet />,
      errorComponent: RouteError,
    });
    const boomRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/boom",
      component: () => {
        if (shouldThrow) {
          throw new Error("Тестовая авария");
        }
        return <p>Страница восстановилась</p>;
      },
    });

    renderRouter("/boom", rootRoute.addChildren([boomRoute]));

    expect(
      await screen.findByText("Не удалось открыть страницу"),
    ).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "Повторить" }));

    expect(
      await screen.findByText("Страница восстановилась"),
    ).toBeInTheDocument();
  });
});
