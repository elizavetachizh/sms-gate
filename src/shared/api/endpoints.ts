import { apiClient } from './client.ts'
import type {
  MailingCreate,
  MailingListParams,
  MailingRead,
  Page,
  ProviderListResponse,
  SendMailingResponse,
  UserRead,
} from './types.ts'

export const meApi = {
  get: () => apiClient.get<UserRead>('/auth/me/'),
}

export const providersApi = {
  list: () => apiClient.get<ProviderListResponse>('/providers/'),
}

export const mailingsApi = {
  ping: () => apiClient.get<{ message: string }>('/mailings/ping'),

  list: (params?: MailingListParams) =>
    apiClient.get<Page<MailingRead>>('/mailings/', {
      status: params?.status,
      limit: params?.limit,
      offset: params?.offset,
    }),

  getById: (mailingId: string) =>
    apiClient.get<MailingRead>(`/mailings/${mailingId}`),

  create: (body: MailingCreate) =>
    apiClient.post<MailingRead>('/mailings/', body),

  send: (mailingId: string) =>
    apiClient.post<SendMailingResponse>(`/mailings/${mailingId}/send`),

  delete: (mailingId: string) => apiClient.delete(`/mailings/${mailingId}`),
}
