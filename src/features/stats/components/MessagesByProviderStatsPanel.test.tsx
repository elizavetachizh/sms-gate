import '@/test/mocks/shared-api'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { statsApi } from '@/test/mocks/shared-api'
import { createHookWrapper } from '@/test/utils/render-hook'
import { MessagesByProviderStatsPanel } from './MessagesByProviderStatsPanel'

describe('MessagesByProviderStatsPanel', () => {
  it('uses one stats request to render chart legend and table details', async () => {
    const params = {
      date_from: '2026-06-01',
      date_to: '2026-06-02',
      timezone: 'UTC',
      fill_gaps: true,
    }

    vi.mocked(statsApi.messagesByProvider).mockResolvedValue({
      date_from: params.date_from,
      date_to: params.date_to,
      timezone: params.timezone,
      items: [
        {
          date: '2026-06-01',
          provider_code: 'fake',
          provider_name: 'Fake',
          status: 'delivered',
          count: 5,
        },
      ],
    })

    render(<MessagesByProviderStatsPanel params={params} />, {
      wrapper: createHookWrapper(),
    })

    await waitFor(() =>
      expect(statsApi.messagesByProvider).toHaveBeenCalledTimes(1),
    )

    expect(statsApi.messagesByProvider).toHaveBeenCalledWith(params)
    expect(await screen.findAllByText('Fake / Доставлено')).toHaveLength(2)
    expect(screen.getByText('Итого')).toBeInTheDocument()
    expect(screen.getAllByText('5').length).toBeGreaterThan(0)
  })

  it('renders empty state when stats response has no items', async () => {
    const params = {
      date_from: '2026-06-01',
      date_to: '2026-06-02',
      timezone: 'UTC',
      fill_gaps: true,
    }

    vi.mocked(statsApi.messagesByProvider).mockResolvedValue({
      date_from: params.date_from,
      date_to: params.date_to,
      timezone: params.timezone,
      items: [],
    })

    render(<MessagesByProviderStatsPanel params={params} />, {
      wrapper: createHookWrapper(),
    })

    expect(await screen.findAllByText('За выбранный период данных нет')).toHaveLength(2)
  })
})
