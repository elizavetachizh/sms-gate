import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mailingsApi } from '@/shared/api'
import { mailingKeys } from '../api/mailings.keys'

export function useSendMailing(mailingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => mailingsApi.send(mailingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mailingKeys.detail(mailingId) })
      queryClient.invalidateQueries({ queryKey: mailingKeys.lists() })
    },
  })
}
