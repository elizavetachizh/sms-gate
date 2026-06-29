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
export { mailingsApi, meApi, providersApi } from './endpoints.ts'
export type {
  ApiDetailError,
  MailingCreate,
  MailingCreateMessage,
  MailingListParams,
  MailingRead,
  MailingStatus,
  MessageRead,
  MessageStatus,
  Page,
  ProviderListResponse,
  SendMailingResponse,
  UserRead,
} from './types.ts'
