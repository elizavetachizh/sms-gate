import { describe, expect, it } from 'vitest'
import type { MessagesByProviderStatsItem } from '@/shared/api'
import {
  getMessagesByProviderSeriesKey,
  pivotMessagesByProvider,
} from './pivot-messages-by-provider'

describe('pivotMessagesByProvider', () => {
  it('pivots long stats rows into date-indexed series', () => {
    const items: MessagesByProviderStatsItem[] = [
      {
        date: '2026-06-01',
        provider_code: 'fake',
        provider_name: 'Fake',
        status: 'submitted',
        count: 2,
      },
      {
        date: '2026-06-03',
        provider_code: 'fake',
        provider_name: 'Fake',
        status: 'submitted',
        count: 3,
      },
      {
        date: '2026-06-01',
        provider_code: 'beltelecom',
        provider_name: 'Белтелеком',
        status: 'delivered',
        count: 5,
      },
    ]

    const pivot = pivotMessagesByProvider(items, {
      dates: ['2026-06-01', '2026-06-02', '2026-06-03'],
    })

    expect(pivot.dates).toEqual(['2026-06-01', '2026-06-02', '2026-06-03'])
    expect(pivot.total).toBe(10)
    expect(pivot.totalsByDate).toEqual({
      '2026-06-01': 7,
      '2026-06-02': 0,
      '2026-06-03': 3,
    })

    expect(
      pivot.series.find(
        (series) =>
          series.key === getMessagesByProviderSeriesKey('fake', 'submitted'),
      )?.data,
    ).toEqual([2, 0, 3])
  })

  it('aggregates duplicate date/provider/status rows', () => {
    const pivot = pivotMessagesByProvider([
      {
        date: '2026-06-01',
        provider_code: 'fake',
        provider_name: null,
        status: 'failed',
        count: 1,
      },
      {
        date: '2026-06-01',
        provider_code: 'fake',
        provider_name: null,
        status: 'failed',
        count: 4,
      },
    ])

    expect(pivot.series).toHaveLength(1)
    expect(pivot.series[0]).toMatchObject({
      provider_code: 'fake',
      provider_name: null,
      status: 'failed',
      total: 5,
      data: [5],
    })
    expect(pivot.total).toBe(5)
  })
})
