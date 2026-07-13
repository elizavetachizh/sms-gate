export type MailingStatus = "created" | "queued" | "submitted";

export type MessageStatus =
  | "created"
  | "queued"
  | "submitted"
  | "delivered"
  | "undelivered"
  | "failed"
  | "unknown";

export interface UserRead {
  id: string;
  is_active: boolean;
  name: string;
  email: string;
}

export interface MessageRead {
  id: string;
  msisdn: string;
  text: string;
  send_on: string | null;
  external_id: string | null;
  status: MessageStatus;
  batch_id: string | null;
}

export interface MailingRead {
  id: string;
  status: MailingStatus;
  messages: MessageRead[];
  created_by: UserRead;
  updated_by: UserRead;
  created_at: string;
  updated_at: string;
}

export interface MailingCreateMessage {
  msisdn: string;
  text: string;
  send_on?: string | null;
}

export interface MailingCreate {
  provider_code: string;
  messages: MailingCreateMessage[];
}

export interface MailingUpdate {
  provider_code?: string;
  messages?: MailingCreateMessage[];
}

export interface Page<T> {
  total: number;
  limit: number;
  offset: number;
  items: T[];
}

export interface ProviderListParams {
  enabled_only?: boolean;
}

export interface ProviderRead {
  code: string;
  name: string;
  is_enabled: boolean;
  max_batch_size: number;
}

export interface ProviderListResponse {
  items: ProviderRead[];
}

export interface ProviderUpdate {
  name?: string;
  is_enabled?: boolean;
}

export interface MailingListParams {
  status?: MailingStatus;
  limit?: number;
  offset?: number;
}

export interface SendMailingResponse {
  message: string;
}

export interface ApiDetailError {
  detail: string;
}

export interface MailingTemplateRead {
  id: string;
  name: string;
  text: string;
  created_by: UserRead;
  updated_by: UserRead;
  created_at: string;
  updated_at: string;
}

export interface MailingTemplateCreate {
  name: string;
  text: string;
}

export interface MailingTemplateUpdate {
  name?: string;
  text?: string;
}

export interface TemplateListParams {
  limit?: number;
  offset?: number;
}

export interface MessagesByProviderStatsParams {
  date_from: string;
  date_to: string;
  timezone: string;
  provider_code?: string[];
  status?: MessageStatus[];
  fill_gaps?: boolean;
}

export interface MessagesByProviderStatsItem {
  date: string;
  provider_code: string;
  provider_name: string | null;
  status: MessageStatus;
  count: number;
}

export interface MessagesByProviderStatsResponse {
  date_from: string;
  date_to: string;
  timezone: string;
  items: MessagesByProviderStatsItem[];
}

export interface SmsTextAnalyzeRequest {
  text: string;
}

export type SmsMessageEncoding = "gsm7" | "ucs2";

export interface SmsTextAnalyzeResponse {
  encoding: SmsMessageEncoding;
  characters: number;
  units: number;
  segments: number;
  capacity: number;
  remaining: number;
  per_segment_limit: number;
  is_concatenated: boolean;
  non_gsm_characters: string[];
}
