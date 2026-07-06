export const STATS_DEFAULT_PERIOD_DAYS = 30
export const STATS_MAX_PERIOD_DAYS = 366
export const DEFAULT_STATS_FILL_GAPS = true

export interface StatsDateRange {
  date_from: string
  date_to: string
  timezone: string
}

function assertDateOnly(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Expected YYYY-MM-DD date, got "${value}"`)
  }
}

function formatDateInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('Could not format date')
  }

  return `${year}-${month}-${day}`
}

function dateOnlyToUtcMs(value: string): number {
  assertDateOnly(value)

  const [year, month, day] = value.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function getTodayDate(timezone = getUserTimezone(), now = new Date()): string {
  return formatDateInTimezone(now, timezone)
}

export function addCalendarDays(date: string, days: number): string {
  const next = new Date(dateOnlyToUtcMs(date))
  next.setUTCDate(next.getUTCDate() + days)

  return next.toISOString().slice(0, 10)
}

export function getInclusiveDaysCount(dateFrom: string, dateTo: string): number {
  const diffMs = dateOnlyToUtcMs(dateTo) - dateOnlyToUtcMs(dateFrom)

  return Math.floor(diffMs / 86_400_000) + 1
}

export function isStatsDateRangeValid(dateFrom: string, dateTo: string): boolean {
  const daysCount = getInclusiveDaysCount(dateFrom, dateTo)

  return daysCount >= 1 && daysCount <= STATS_MAX_PERIOD_DAYS
}

export function getDefaultStatsDateRange(
  timezone = getUserTimezone(),
  now = new Date(),
): StatsDateRange {
  const dateTo = getTodayDate(timezone, now)

  return {
    date_from: addCalendarDays(dateTo, -(STATS_DEFAULT_PERIOD_DAYS - 1)),
    date_to: dateTo,
    timezone,
  }
}

export function getDateRangeDays(dateFrom: string, dateTo: string): string[] {
  const daysCount = getInclusiveDaysCount(dateFrom, dateTo)

  if (daysCount < 1) {
    return []
  }

  return Array.from({ length: daysCount }, (_, index) =>
    addCalendarDays(dateFrom, index),
  )
}
