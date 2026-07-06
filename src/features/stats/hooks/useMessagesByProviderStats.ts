import { useQuery } from '@tanstack/react-query'
import { statsApi, type MessagesByProviderStatsParams } from '@/shared/api'
import { statsKeys } from '../api/stats.keys'

export function useMessagesByProviderStats(params: MessagesByProviderStatsParams) {
  return useQuery({
    queryKey: statsKeys.messagesByProvider(params),
    queryFn: () => statsApi.messagesByProvider(params),
  })
}