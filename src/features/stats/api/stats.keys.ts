import type { MessagesByProviderStatsParams } from "@/shared/api/types";

export const statsKeys = {
  all: ['stats'] as const,
  messagesByProvider: (params: MessagesByProviderStatsParams) => [...statsKeys.all, 'messagesByProvider', params] as const,
}