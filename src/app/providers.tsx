import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { isUnauthorizedError } from "@/shared/api";

const queryClient = new QueryClient({
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
