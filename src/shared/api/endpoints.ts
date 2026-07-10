import { apiClient } from "./client.ts";
import type {
  MailingCreate,
  MailingCreateMessage,
  MailingListParams,
  MailingRead,
  MailingTemplateCreate,
  MailingTemplateRead,
  MailingTemplateUpdate,
  MailingUpdate,
  MessageRead,
  MessagesByProviderStatsParams,
  MessagesByProviderStatsResponse,
  Page,
  ProviderListParams,
  ProviderListResponse,
  ProviderRead,
  ProviderUpdate,
  SendMailingResponse,
  TemplateListParams,
  UserRead,
} from "./types.ts";

export const meApi = {
  get: () => apiClient.get<UserRead>("/auth/me/"),
};

export const providersApi = {
  list: (params?: ProviderListParams) =>
    apiClient.get<ProviderListResponse>("/providers/", {
      enabled_only: params?.enabled_only ?? true,
    }),

  update: (code: string, body: ProviderUpdate) =>
    apiClient.patch<ProviderRead>(`/providers/${code}`, body),
};

export const mailingsApi = {
  ping: () => apiClient.get<{ message: string }>("/mailings/ping"),

  list: (params?: MailingListParams) =>
    apiClient.get<Page<MailingRead>>("/mailings/", {
      status: params?.status,
      limit: params?.limit,
      offset: params?.offset,
    }),

  getById: (mailingId: string) =>
    apiClient.get<MailingRead>(`/mailings/${mailingId}`),

  create: (body: MailingCreate) =>
    apiClient.post<MailingRead>("/mailings/", body),

  send: (mailingId: string) =>
    apiClient.post<SendMailingResponse>(`/mailings/${mailingId}/send`),

  update: (mailingId: string, body: MailingUpdate) =>
    apiClient.put<MailingRead>(`/mailings/${mailingId}/`, body),

  delete: (mailingId: string) => apiClient.delete(`/mailings/${mailingId}`),
};

export const messagesApi = {
  getById: (mailingId: string, messageId: string) =>
    apiClient.get<MessageRead>(`/mailings/${mailingId}/messages/${messageId}`),

  create: (mailingId: string, body: MailingCreateMessage) =>
    apiClient.post<MessageRead>(`/mailings/${mailingId}/messages/`, body),

  update: (mailingId: string, messageId: string, body: MailingCreateMessage) =>
    apiClient.put<MessageRead>(
      `/mailings/${mailingId}/messages/${messageId}`,
      body,
    ),

  delete: (mailingId: string, messageId: string) =>
    apiClient.delete(`/mailings/${mailingId}/messages/${messageId}`),
};

export const templatesApi = {
  list: (params?: TemplateListParams) =>
    apiClient.get<Page<MailingTemplateRead>>("/templates/", {
      limit: params?.limit,
      offset: params?.offset,
    }),

  getById: (templateId: string) =>
    apiClient.get<MailingTemplateRead>(`/templates/${templateId}`),

  create: (body: MailingTemplateCreate) =>
    apiClient.post<MailingTemplateRead>("/templates/", body),

  update: (templateId: string, body: MailingTemplateUpdate) =>
    apiClient.patch<MailingTemplateRead>(`/templates/${templateId}`, body),

  delete: (templateId: string) => apiClient.delete(`/templates/${templateId}`),
};

export const statsApi = {
  messagesByProvider: (params: MessagesByProviderStatsParams) =>
    apiClient.get<MessagesByProviderStatsResponse>(
      "/stats/messages-by-provider",
      {
        date_from: params.date_from,
        date_to: params.date_to,
        provider_code: params.provider_code,
        timezone: params.timezone,
        status: params.status,
        fill_gaps: params.fill_gaps,
      },
    ),
};
