import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from './client'
import { BadRequestError, ConflictError } from './errors'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ApiClient', () => {
  it('serializes array query params as repeated search params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const client = new ApiClient('/api/v1', () => 'test-key')

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
        new Response(JSON.stringify({ detail: 'Unknown timezone: Test/Zone' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const client = new ApiClient('/api/v1', () => 'test-key')

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
        new Response(
          JSON.stringify({
            detail: 'Mailing can be updated only in created status',
          }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    )

    const client = new ApiClient('/api/v1', () => 'test-key')

    const request = client.delete('/mailings/test-id')

    await expect(request).rejects.toBeInstanceOf(ConflictError)
    await expect(request).rejects.toMatchObject({
      name: 'ConflictError',
      detail: 'Mailing can be updated only in created status',
    })
  })
})
