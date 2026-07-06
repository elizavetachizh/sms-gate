import { useMemo } from 'react'
import { useMessagesByProviderStats } from '@/features/stats/hooks/useMessagesByProviderStats'
import { getDateRangeDays } from '@/features/stats/lib/stats-date'
import { pivotMessagesByProvider } from '@/features/stats/lib/pivot-messages-by-provider'
import { MessagesByProviderChart } from './MessagesByProviderChart'
import { MessagesByProviderTable } from './MessagesByProviderTable'
import type { MessagesByProviderStatsParams } from '@/shared/api'

interface MessagesByProviderStatsPanelProps {
  params: MessagesByProviderStatsParams
}

export function MessagesByProviderStatsPanel({
  params,
}: MessagesByProviderStatsPanelProps) {
  const { data, isLoading, error } = useMessagesByProviderStats(params)

  const pivot = useMemo(() => {
    if (!data) {
      return null
    }

    return pivotMessagesByProvider(data.items, {
      dates: getDateRangeDays(data.date_from, data.date_to),
    })
  }, [data])

  return (
    <>
      <MessagesByProviderChart
        pivot={pivot}
        isLoading={isLoading}
        error={error}
      />
      <MessagesByProviderTable
        pivot={pivot}
        isLoading={isLoading}
        error={error}
      />
    </>
  )
}
