import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { AppLayout } from "./layout/AppLayout";
import { Header } from "./layout/Header";
import { RouteError, RouteNotFound } from "./route-fallbacks";
import { LoginPage } from "../pages/LoginPage";
import { MailingsListPage } from "../pages/MailingsListPage";
import { CreateMailingPage } from "../pages/CreateMailingPage";
import { MailingDetailPage } from "../pages/MailingDetailPage";
import { TemplatesListPage } from "../pages/TemplatesListPage";
import { CreateTemplatePage } from "../pages/CreateTemplatePage";
import { EditTemplatePage } from "../pages/EditTemplatePage";
import { ProvidersListPage } from "../pages/ProvidersListPage";
import { UsersListPage } from "../pages/UsersListPage";
import type { MailingStatus } from "@/shared/api";
import { getCredentials } from "@/features/auth/credentials-storage";
import { requireAdmin } from "@/features/auth/require-admin";
import type { LoginSearch } from "@/features/auth/search";
import { defaultMailingsSearch } from "../features/mailings/search";
import { defaultUsersSearch } from "@/features/users/search";
import { StatsPage } from "@/pages/StatsPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: RouteNotFound,
  errorComponent: RouteError,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect:
      typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: () => {
    if (getCredentials()) {
      throw redirect({ to: "/mailings", search: defaultMailingsSearch });
    }
  },
  component: LoginPage,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "/_authenticated",
  beforeLoad: ({ location }) => {
    if (!getCredentials()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: () => (
    <div className="flex min-h-svh flex-col">
      <Header />
      <AppLayout />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/mailings", search: defaultMailingsSearch });
  },
});

const mailingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/mailings",
  validateSearch: (search: Record<string, unknown>) => ({
    status: search.status as MailingStatus | undefined,
    limit: Number(search.limit ?? 20),
    offset: Number(search.offset ?? 0),
  }),
  component: MailingsListPage,
});

const mailingsNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/mailings/new",
  component: CreateMailingPage,
});

const mailingDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/mailings/$mailingId",
  component: MailingDetailPage,
});

const templatesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/templates",
  validateSearch: (search: Record<string, unknown>) => ({
    limit: Number(search.limit ?? 20),
    offset: Number(search.offset ?? 0),
  }),
  component: TemplatesListPage,
});

const templatesNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/templates/new",
  component: CreateTemplatePage,
});

const templateEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/templates/$templateId/edit",
  component: EditTemplatePage,
});

const providersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/providers",
  validateSearch: () => ({}),
  component: ProvidersListPage,
});

const statsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/stats",
  component: StatsPage,
});

const usersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/users",
  validateSearch: (search: Record<string, unknown>) => ({
    limit: Number(search.limit ?? defaultUsersSearch.limit),
    offset: Number(search.offset ?? defaultUsersSearch.offset),
  }),
  beforeLoad: requireAdmin,
  component: UsersListPage,
});

const unmatchedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: RouteNotFound,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    indexRoute,
    mailingsRoute,
    mailingsNewRoute,
    mailingDetailRoute,
    templatesRoute,
    templatesNewRoute,
    templateEditRoute,
    providersRoute,
    statsRoute,
    usersRoute,
  ]),
  unmatchedRoute,
]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: RouteNotFound,
  defaultErrorComponent: RouteError,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
