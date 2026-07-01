import { useQuery } from '@tanstack/react-query'
import { providersApi, type ProviderListParams } from '@/shared/api'
import { providerKeys } from '../api/providers.keys'

export function useProviders(params: ProviderListParams = { enabled_only: true }) {
  return useQuery({
    queryKey: providerKeys.list(params),
    queryFn: () => providersApi.list(params),
  })
}
