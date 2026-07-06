import { vi } from 'vitest'

export const mailingsApi = {
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  send: vi.fn(),
  delete: vi.fn(),
  ping: vi.fn(),
}

export const meApi = {
  get: vi.fn(),
}

export const providersApi = {
  list: vi.fn(),
  update: vi.fn(),
}

export const templatesApi = {
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

export const statsApi = {
  messagesByProvider: vi.fn(),
}

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()

  return {
    ...actual,
    mailingsApi,
    meApi,
    providersApi,
    statsApi,
    templatesApi,
  }
})
