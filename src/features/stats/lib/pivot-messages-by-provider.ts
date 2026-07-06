import type { MessageStatus, MessagesByProviderStatsItem } from '@/shared/api'

export const messageStatusOrder: MessageStatus[] = [
  'created',
  'queued',
  'submitted',
  'delivered',
  'undelivered',
  'failed',
  'unknown',
]

export interface MessagesByProviderSeries {
  key: string
  provider_code: string
  provider_name: string | null
  status: MessageStatus
  label: string
  total: number
  data: number[]
}

export interface MessagesByProviderPivot {
  dates: string[]
  series: MessagesByProviderSeries[]
  totalsByDate: Record<string, number>
  total: number
}

export interface PivotMessagesByProviderOptions {
  dates?: string[]
}

function getProviderLabel(item: Pick<MessagesByProviderStatsItem, 'provider_code' | 'provider_name'>) {
  return item.provider_name ?? item.provider_code
}

export function getMessagesByProviderSeriesKey(
  providerCode: string,
  status: MessageStatus,
): string {
  return `${providerCode}:${status}`
}

export function pivotMessagesByProvider(
  items: MessagesByProviderStatsItem[],
  options: PivotMessagesByProviderOptions = {},
): MessagesByProviderPivot {
  const dates = [...new Set(options.dates ?? items.map((item) => item.date))].sort()
  const dateIndex = new Map(dates.map((date, index) => [date, index]))
  const seriesByKey = new Map<string, MessagesByProviderSeries>()
  const totalsByDate = Object.fromEntries(dates.map((date) => [date, 0]))
  let total = 0

  for (const item of items) {
    const index = dateIndex.get(item.date)

    if (index === undefined) {
      continue
    }

    const key = getMessagesByProviderSeriesKey(item.provider_code, item.status)
    const providerLabel = getProviderLabel(item)
    const current = seriesByKey.get(key)

    if (current) {
      current.data[index] += item.count
      current.total += item.count
    } else {
      const data = Array.from({ length: dates.length }, () => 0)
      data[index] = item.count

      seriesByKey.set(key, {
        key,
        provider_code: item.provider_code,
        provider_name: item.provider_name,
        status: item.status,
        label: `${providerLabel} / ${item.status}`,
        total: item.count,
        data,
      })
    }

    totalsByDate[item.date] = (totalsByDate[item.date] ?? 0) + item.count
    total += item.count
  }

  const series = [...seriesByKey.values()].sort((left, right) => {
    const providerCompare = getProviderLabel(left).localeCompare(getProviderLabel(right), 'ru')

    if (providerCompare !== 0) {
      return providerCompare
    }

    return messageStatusOrder.indexOf(left.status) - messageStatusOrder.indexOf(right.status)
  })

  return {
    dates,
    series,
    totalsByDate,
    total,
  }
}
