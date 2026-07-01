import { apiClient } from './client.ts'
import type {
  MailingCreate,
  MailingListParams,
  MailingRead,
  MailingTemplateCreate,
  MailingTemplateRead,
  MailingTemplateUpdate,
  Page,
  ProviderListResponse,
  ProviderRead,
  ProviderUpdate,
  SendMailingResponse,
  TemplateListParams,
  UserRead,
} from './types.ts'

export const meApi = {
  get: () => apiClient.get<UserRead>('/auth/me/'),
}

export const providersApi = {
  list: () => apiClient.get<ProviderListResponse>('/providers/'),
  getByCode: (code: string) => apiClient.get<ProviderRead>(`/providers/${code}`),
  update: (code: string, body: ProviderUpdate) => apiClient.patch<ProviderRead>(`/providers/${code}`, body),
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

export const templatesApi = {
  list: (params?: TemplateListParams) =>
    apiClient.get<Page<MailingTemplateRead>>('/templates/', {
      limit: params?.limit,
      offset: params?.offset,
    }),

  getById: (templateId: string) =>
    apiClient.get<MailingTemplateRead>(`/templates/${templateId}`),

  create: (body: MailingTemplateCreate) =>
    apiClient.post<MailingTemplateRead>('/templates/', body),

  update: (templateId: string, body: MailingTemplateUpdate) =>
    apiClient.patch<MailingTemplateRead>(`/templates/${templateId}`, body),

  delete: (templateId: string) => apiClient.delete(`/templates/${templateId}`),
}
