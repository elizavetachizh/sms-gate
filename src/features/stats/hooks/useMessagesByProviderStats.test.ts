import '@/test/mocks/shared-api'
import { describe, expect, it, vi } from 'vitest'
import { statsApi } from '@/test/mocks/shared-api'
import {
  createHookWrapper,
  createTestQueryClient,
  renderHook,
  waitFor,
} from '@/test/utils/render-hook'
import { statsKeys } from '../api/stats.keys'
import { useMessagesByProviderStats } from './useMessagesByProviderStats'

describe('useMessagesByProviderStats', () => {
  it('loads messages-by-provider stats with given params', async () => {
    const params = {
      date_from: '2026-06-01',
      date_to: '2026-06-30',
      timezone: 'Europe/Minsk',
      provider_code: ['fake'],
      status: ['submitted' as const],
      fill_gaps: true,
    }
    const response = {
      date_from: params.date_from,
      date_to: params.date_to,
      timezone: params.timezone,
      items: [
        {
          date: '2026-06-01',
          provider_code: 'fake',
          provider_name: 'Fake',
          status: 'submitted' as const,
          count: 7,
        },
      ],
    }

    vi.mocked(statsApi.messagesByProvider).mockResolvedValue(response)

    const { result } = renderHook(() => useMessagesByProviderStats(params), {
      wrapper: createHookWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(statsApi.messagesByProvider).toHaveBeenCalledWith(params)
    expect(result.current.data).toEqual(response)
  })

  it('uses params in query key', async () => {
    const queryClient = createTestQueryClient()
    const params = {
      date_from: '2026-06-01',
      date_to: '2026-06-30',
      timezone: 'UTC',
      fill_gaps: true,
    }

    vi.mocked(statsApi.messagesByProvider).mockResolvedValue({
      date_from: params.date_from,
      date_to: params.date_to,
      timezone: params.timezone,
      items: [],
    })

    renderHook(() => useMessagesByProviderStats(params), {
      wrapper: createHookWrapper(queryClient),
    })

    await waitFor(() =>
      expect(
        queryClient.getQueryState(statsKeys.messagesByProvider(params))?.status,
      ).toBe('success'),
    )
  })
})
