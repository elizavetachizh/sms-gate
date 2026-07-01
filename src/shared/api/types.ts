export type MailingStatus = 'created' | 'queued' | 'submitted'

export type MessageStatus =
  | 'created'
  | 'queued'
  | 'submitted'
  | 'delivered'
  | 'undelivered'
  | 'failed'
  | 'unknown'

export interface UserRead {
  id: string
  is_active: boolean
  name: string
  email: string
}

export interface MessageRead {
  id: string
  msisdn: string
  text: string
  send_on: string | null
  external_id: string | null
  status: MessageStatus
  batch_id: string | null
}

export interface MailingRead {
  id: string
  status: MailingStatus
  messages: MessageRead[]
  created_by: UserRead
  updated_by: UserRead
  created_at: string
  updated_at: string
}

export interface MailingCreateMessage {
  msisdn: string
  text: string
  send_on?: string | null
}

export interface MailingCreate {
  provider_code: string
  messages: MailingCreateMessage[]
}

export interface Page<T> {
  total: number
  limit: number
  offset: number
  items: T[]
}

export interface ProviderListParams {
  limit?: number
  offset?: number
}

export interface ProviderRead {
  code: string
  name: string
  is_enabled: boolean,
  max_batch_size: number,
}
export interface ProviderListResponse {
  items: ProviderRead[]
}
export interface ProviderUpdate {
  is_enabled?: boolean,
  max_batch_size?: number,
}

export interface MailingListParams {
  status?: MailingStatus
  limit?: number
  offset?: number
}

export interface SendMailingResponse {
  message: string
}

export interface ApiDetailError {
  detail: string
}

export interface MailingTemplateRead {
  id: string
  name: string
  text: string
  created_by: UserRead
  updated_by: UserRead
  created_at: string
  updated_at: string
}

export interface MailingTemplateCreate {
  name: string
  text: string
}

export interface MailingTemplateUpdate {
  name?: string
  text?: string
}

export interface TemplateListParams {
  limit?: number
  offset?: number
}
