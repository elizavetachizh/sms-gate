import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { AppLayout } from './layout/AppLayout'
import { Header } from './layout/Header'
import { MailingsListPage } from '../pages/MailingsListPage'
import { CreateMailingPage } from '../pages/CreateMailingPage'
import { MailingDetailPage } from '../pages/MailingDetailPage'
import { TemplatesListPage } from '../pages/TemplatesListPage'
import { CreateTemplatePage } from '../pages/CreateTemplatePage'
import { EditTemplatePage } from '../pages/EditTemplatePage'
import { ProvidersListPage } from '../pages/ProvidersListPage'
import type { MailingStatus } from '@/shared/api'
import { defaultMailingsSearch } from '../features/mailings/search'

const rootRoute = createRootRoute({
  component: () => (
    <div className="flex min-h-svh flex-col">
      <Header />
      <AppLayout />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/mailings', search: defaultMailingsSearch })
  },
})

const mailingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mailings',
  validateSearch: (search: Record<string, unknown>) => ({
    status: search.status as MailingStatus | undefined,
    limit: Number(search.limit ?? 20),
    offset: Number(search.offset ?? 0),
  }),
  component: MailingsListPage,
})

const mailingsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mailings/new',
  component: CreateMailingPage,
})

const mailingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mailings/$mailingId',
  component: MailingDetailPage,
})

const templatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/templates',
  validateSearch: (search: Record<string, unknown>) => ({
    limit: Number(search.limit ?? 20),
    offset: Number(search.offset ?? 0),
  }),
  component: TemplatesListPage,
})

const templatesNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/templates/new',
  component: CreateTemplatePage,
})

const templateEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/templates/$templateId/edit',
  component: EditTemplatePage,
})

const providersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/providers',
  validateSearch: () => ({}),
  component: ProvidersListPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  mailingsRoute,
  mailingsNewRoute,
  mailingDetailRoute,
  templatesRoute,
  templatesNewRoute,
  templateEditRoute,
  providersRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
