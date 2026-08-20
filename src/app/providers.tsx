import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  onUnauthorizedError,
  toInternalRedirect,
} from "@/features/auth/session";
import { queryClient, registerQueryCacheErrorHandler } from "./query-client";
import { router } from "./router";

registerQueryCacheErrorHandler((error) => {
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
});

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
