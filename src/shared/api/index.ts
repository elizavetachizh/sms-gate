export { apiClient, ApiClient, type RequestOptions } from './client.ts'
export { clearApiKey, getApiBaseUrl, getApiKey, setApiKey } from './config.ts'
export {
  ApiError,
  isApiError,
  isNotFoundError,
  isUnauthorizedError,
  isValidationError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  type ValidationDetail,
} from './errors.ts'
export { mailingsApi, meApi, providersApi, templatesApi } from './endpoints.ts'
export type {
  ApiDetailError,
  MailingCreate,
  MailingCreateMessage,
  MailingListParams,
  MailingRead,
  MailingStatus,
  MailingTemplateCreate,
  MailingTemplateRead,
  MailingTemplateUpdate,
  MessageRead,
  MessageStatus,
  Page,
  ProviderListResponse,
  ProviderRead,
  ProviderListParams,
  ProviderUpdate,
  SendMailingResponse,
  TemplateListParams,
  UserRead,
} from './types.ts'
