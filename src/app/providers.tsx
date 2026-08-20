import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { onUnauthorizedError, toInternalRedirect } from "@/features/auth/session";
import { isUnauthorizedError } from "@/shared/api";
import { router } from "./router";

function handleUnauthorized(error: unknown) {
  onUnauthorizedError(
    error,
    queryClient,
    {
      pathname: router.state.location.pathname,
      href: router.state.location.href,
    },
    (redirectHref) => {
      void router.navigate({
        to: "/login",
        replace: true,
        search: { redirect: toInternalRedirect(redirectHref) },
      });
    },
  );
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleUnauthorized,
  }),
  mutationCache: new MutationCache({
    onError: handleUnauthorized,
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: import.meta.env.PROD,
      retry: (failureCount, error) => {
        if (isUnauthorizedError(error)) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
