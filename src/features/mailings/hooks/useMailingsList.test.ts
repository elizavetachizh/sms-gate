import '@/test/mocks/shared-api'
import { describe, expect, it, vi } from 'vitest'
import { mailingsApi } from '@/test/mocks/shared-api'
import {
  createHookWrapper,
  createTestQueryClient,
  renderHook,
  waitFor,
} from '@/test/utils/render-hook'
import { mailingsPageFixture } from '@/test/fixtures'
import { mailingKeys } from '../api/mailings.keys'
import { useMailingsList } from './useMailingsList'

describe('useMailingsList', () => {
  it('loads mailings with given params', async () => {
    const params = { status: 'created' as const, limit: 20, offset: 0 }
    const page = mailingsPageFixture()
    vi.mocked(mailingsApi.list).mockResolvedValue(page)

    const { result } = renderHook(() => useMailingsList(params), {
      wrapper: createHookWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mailingsApi.list).toHaveBeenCalledWith(params)
    expect(result.current.data).toEqual(page)
  })

  it('uses params in query key', async () => {
    const queryClient = createTestQueryClient()
    const params = { limit: 10, offset: 5 }
    vi.mocked(mailingsApi.list).mockResolvedValue(mailingsPageFixture())

    renderHook(() => useMailingsList(params), {
      wrapper: createHookWrapper(queryClient),
    })

    await waitFor(() =>
      expect(
        queryClient.getQueryState(mailingKeys.list(params))?.status,
      ).toBe('success'),
    )
  })
})
