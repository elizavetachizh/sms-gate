import type { MailingListParams } from '@/shared/api'

export const mailingKeys = {
  all: ['mailings'] as const,
  lists: () => [...mailingKeys.all, 'list'] as const,
  list: (params: MailingListParams) => [...mailingKeys.lists(), params] as const,
  details: () => [...mailingKeys.all, 'detail'] as const,
  detail: (id: string) => [...mailingKeys.details(), id] as const,
}
