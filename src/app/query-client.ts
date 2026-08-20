import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/shared/api";

type CacheErrorHandler = (error: unknown) => void;

let cacheErrorHandler: CacheErrorHandler | undefined;

export function registerQueryCacheErrorHandler(handler: CacheErrorHandler) {
  cacheErrorHandler = handler;
}

function handleCacheError(error: unknown) {
  cacheErrorHandler?.(error);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleCacheError,
  }),
  mutationCache: new MutationCache({
    onError: handleCacheError,
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
