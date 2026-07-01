import { useMutation, useQueryClient } from '@tanstack/react-query'
import { providersApi, type ProviderUpdate } from '@/shared/api'
import { providerKeys } from '../api/providers.keys'

interface UpdateProviderVariables {
  code: string
  payload: ProviderUpdate
}

export function useUpdateProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ code, payload }: UpdateProviderVariables) =>
      providersApi.update(code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() })
    },
  })
}
