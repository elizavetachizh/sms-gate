import { useQuery } from '@tanstack/react-query'
import { mailingsApi, type MailingListParams } from '@/shared/api'
import { mailingKeys } from '../api/mailings.keys'

export function useMailingsList(params: MailingListParams) {
  return useQuery({
    queryKey: mailingKeys.list(params),
    queryFn: () => mailingsApi.list(params),
  })
}
