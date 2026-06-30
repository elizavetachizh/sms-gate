import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mailingsApi } from '@/shared/api'
import { mailingKeys } from '../api/mailings.keys'

export function useDeleteMailing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mailingId: string) => mailingsApi.delete(mailingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mailingKeys.lists() })
    },
  })
}
