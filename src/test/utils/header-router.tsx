import { QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { Header } from "@/app/layout/Header";
import { defaultMailingsSearch } from "@/features/mailings/search";
import { defaultProvidersSearch } from "@/features/providers/search";
import { defaultTemplatesSearch } from "@/features/templates/search";
import { defaultUsersSearch } from "@/features/users/search";
import { createTestQueryClient } from "./render-hook";

export function createHeaderTestRouter(initialPath = "/mailings") {
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
    validateSearch: () => defaultMailingsSearch,
    component: () => null,
  });
  const templatesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/templates",
    validateSearch: () => defaultTemplatesSearch,
    component: () => null,
  });
  const providersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/providers",
    validateSearch: () => defaultProvidersSearch,
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
    validateSearch: () => defaultUsersSearch,
    component: () => null,
  });

  return createRouter({
    routeTree: rootRoute.addChildren([
      mailingsRoute,
      templatesRoute,
      providersRoute,
      statsRoute,
      usersRoute,
    ]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

export function renderHeader(initialPath = "/mailings") {
  const queryClient = createTestQueryClient();
  const router = createHeaderTestRouter(initialPath);

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
