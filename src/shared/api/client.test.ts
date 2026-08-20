import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from './client'
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from './errors'
import type { BasicCredentials } from './types'

const testCredentials: BasicCredentials = {
  email: 'user@example.com',
  password: 'password123',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ApiClient', () => {
  it('sends Authorization Basic and does not send X-API-Key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new ApiClient('/api/v1', () => testCredentials)

    await client.get('/users/me/')

    const headers = new Headers(fetchMock.mock.calls[0][1].headers)
    expect(headers.get('Authorization')).toBe(
      `Basic ${btoa(`${testCredentials.email}:${testCredentials.password}`)}`,
    )
    expect(headers.has('X-API-Key')).toBe(false)
  })

  it('throws UnauthorizedError for 401 responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const client = new ApiClient('/api/v1', () => testCredentials)

    await expect(client.get('/users/me/')).rejects.toBeInstanceOf(
      UnauthorizedError,
    )
  })

  it('throws UnauthorizedError without calling fetch when credentials are missing', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const client = new ApiClient('/api/v1', () => null)

    await expect(client.get('/users/me/')).rejects.toBeInstanceOf(
      UnauthorizedError,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uses explicit auth for a login probe when stored credentials are missing', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new ApiClient('/api/v1', () => null)

    await client.get('/users/me/', undefined, { auth: testCredentials })

    const headers = new Headers(fetchMock.mock.calls[0][1].headers)
    expect(headers.get('Authorization')).toBe(
      `Basic ${btoa(`${testCredentials.email}:${testCredentials.password}`)}`,
    )
  })

  it('throws ForbiddenError for 403 responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const client = new ApiClient('/api/v1', () => testCredentials)
    const request = client.get('/users/')

    await expect(request).rejects.toBeInstanceOf(ForbiddenError)
    await expect(request).rejects.toMatchObject({
      name: 'ForbiddenError',
      status: 403,
    })
  })

  it('serializes array query params as repeated search params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new ApiClient('/api/v1', () => testCredentials)

    await client.get('/stats/messages-by-provider', {
      date_from: '2026-06-01',
      date_to: '2026-06-30',
      status: ['submitted', 'delivered'],
      provider_code: ['fake', 'beltelecom'],
      fill_gaps: true,
    })

    const requestUrl = new URL(fetchMock.mock.calls[0][0])

    expect(requestUrl.searchParams.getAll('status')).toEqual([
      'submitted',
      'delivered',
    ])
    expect(requestUrl.searchParams.getAll('provider_code')).toEqual([
      'fake',
      'beltelecom',
    ])
    expect(requestUrl.searchParams.get('fill_gaps')).toBe('true')
  })

  it('throws BadRequestError with parsed detail for 400 responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ detail: 'Unknown timezone: Test/Zone' }, 400),
      ),
    )

    const client = new ApiClient('/api/v1', () => testCredentials)

    const request = client.get('/stats/messages-by-provider', {
      date_from: '2026-06-01',
      date_to: '2026-06-30',
    })

    await expect(request).rejects.toBeInstanceOf(BadRequestError)
    await expect(request).rejects.toMatchObject({
      name: 'BadRequestError',
      detail: 'Unknown timezone: Test/Zone',
    })
  })

  it('throws ConflictError with parsed detail for 409 responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            detail: 'Mailing can be updated only in created status',
          },
          409,
        ),
      ),
    )

    const client = new ApiClient('/api/v1', () => testCredentials)

    const request = client.delete('/mailings/test-id')

    await expect(request).rejects.toBeInstanceOf(ConflictError)
    await expect(request).rejects.toMatchObject({
      name: 'ConflictError',
      detail: 'Mailing can be updated only in created status',
    })
  })
})
