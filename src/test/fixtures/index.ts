import type {
  MailingRead,
  MailingTemplateRead,
  MessageRead,
  Page,
  ProviderListResponse,
  UserRead,
} from '@/shared/api'

export const userFixture: UserRead = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  is_active: true,
  name: '',
  email: 'user@example.com',
}

export function messageFixture(overrides: Partial<MessageRead> = {}): MessageRead {
  return {
    id: '770e8400-e29b-41d4-a716-446655440002',
    msisdn: '375291234567',
    text: 'Привет!',
    send_on: null,
    external_id: null,
    status: 'created',
    batch_id: null,
    ...overrides,
  }
}

export function mailingFixture(overrides: Partial<MailingRead> = {}): MailingRead {
  return {
    id: '660e8400-e29b-41d4-a716-446655440001',
    status: 'created',
    messages: [messageFixture()],
    created_by: userFixture,
    updated_by: userFixture,
    created_at: '2026-06-29T10:00:00+00:00',
    updated_at: '2026-06-29T10:00:00+00:00',
    ...overrides,
  }
}

export function mailingsPageFixture(
  items: MailingRead[] = [mailingFixture()],
  overrides: Partial<Page<MailingRead>> = {},
): Page<MailingRead> {
  return {
    total: items.length,
    limit: 20,
    offset: 0,
    items,
    ...overrides,
  }
}

export function templateFixture(
  overrides: Partial<MailingTemplateRead> = {},
): MailingTemplateRead {
  return {
    id: '880e8400-e29b-41d4-a716-446655440003',
    name: 'Приветствие',
    text: 'Здравствуйте!',
    created_by: userFixture,
    updated_by: userFixture,
    created_at: '2026-06-29T10:00:00+00:00',
    updated_at: '2026-06-29T10:00:00+00:00',
    ...overrides,
  }
}

export function templatesPageFixture(
  items: MailingTemplateRead[] = [templateFixture()],
): Page<MailingTemplateRead> {
  return {
    total: items.length,
    limit: 20,
    offset: 0,
    items,
  }
}

export const providersListFixture: ProviderListResponse = {
  items: [
    {
      code: 'fake',
      name: 'Fake provider',
      is_enabled: true,
      max_batch_size: 100,
    },
  ],
}
