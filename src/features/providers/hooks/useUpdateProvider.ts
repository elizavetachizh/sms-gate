import { useMutation, useQueryClient } from '@tanstack/react-query'
import { providersApi, type ProviderUpdate } from '@/shared/api'
import { providerKeys } from '../api/providers.keys'

export function useUpdateProvider(providerCode: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProviderUpdate) =>
      providersApi.update(providerCode, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() })
    },
  })
}
