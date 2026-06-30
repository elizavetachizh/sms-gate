import { useQuery } from '@tanstack/react-query'
import { mailingsApi } from '@/shared/api'
import { mailingKeys } from '../api/mailings.keys'
import { hasPendingMessages } from '../lib/message-status'

const POLL_INTERVAL_MS = 3_000

export function useMailingDetail(mailingId: string) {
  return useQuery({
    queryKey: mailingKeys.detail(mailingId),
    queryFn: () => mailingsApi.getById(mailingId),
    refetchInterval: (query) => {
      const mailing = query.state.data
      if (!mailing) return false
      if (mailing.status === 'created') return false
      return hasPendingMessages(mailing.messages) ? POLL_INTERVAL_MS : false
    },
  })
}
