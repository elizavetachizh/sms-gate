import { describe, expect, it } from 'vitest'
import {
  STATS_DEFAULT_PERIOD_DAYS,
  addCalendarDays,
  getDateRangeDays,
  getDefaultStatsDateRange,
  getInclusiveDaysCount,
  isStatsDateRangeValid,
} from './stats-date'

describe('stats-date', () => {
  it('builds default 30-day range in given timezone', () => {
    const range = getDefaultStatsDateRange(
      'UTC',
      new Date('2026-07-06T12:00:00Z'),
    )

    expect(range).toEqual({
      date_from: '2026-06-07',
      date_to: '2026-07-06',
      timezone: 'UTC',
    })
    expect(getInclusiveDaysCount(range.date_from, range.date_to)).toBe(
      STATS_DEFAULT_PERIOD_DAYS,
    )
  })

  it('adds calendar days using YYYY-MM-DD values', () => {
    expect(addCalendarDays('2026-06-30', 1)).toBe('2026-07-01')
    expect(addCalendarDays('2026-07-01', -1)).toBe('2026-06-30')
  })

  it('returns inclusive date range days', () => {
    expect(getDateRangeDays('2026-06-01', '2026-06-03')).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
    ])
  })

  it('validates stats period boundaries', () => {
    expect(isStatsDateRangeValid('2026-06-01', '2026-06-01')).toBe(true)
    expect(isStatsDateRangeValid('2026-06-02', '2026-06-01')).toBe(false)
    expect(isStatsDateRangeValid('2025-01-01', '2026-01-02')).toBe(false)
  })
})
