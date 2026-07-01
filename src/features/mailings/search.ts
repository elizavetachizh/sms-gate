import type { MailingStatus } from '@/shared/api'

export type MailingsSearch = {
  status: MailingStatus | undefined
  limit: number
  offset: number
}
export type ProvidersSearch = {
  limit: number
  offset: number
}

export const defaultMailingsSearch: MailingsSearch = {
  status: undefined,
  limit: 20,
  offset: 0,
}

export const defaultProvidersSearch: ProvidersSearch = {
  limit: 20,
  offset: 0,
}