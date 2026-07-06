import { useState } from 'react'
import { MessagesByProviderStatsPanel } from '@/features/stats/components/MessagesByProviderStatsPanel'
import { StatsFilters } from '@/features/stats/components/StatsFilters'
import {
  DEFAULT_STATS_FILL_GAPS,
  getDefaultStatsDateRange,
} from '@/features/stats/lib/stats-date'
import type { MessagesByProviderStatsParams } from '@/shared/api'

function getDefaultStatsParams(): MessagesByProviderStatsParams {
  return {
    ...getDefaultStatsDateRange(),
    fill_gaps: DEFAULT_STATS_FILL_GAPS,
  }
}

export function StatsPage() {
  const [params, setParams] = useState(getDefaultStatsParams)

  return (
    <div className="space-y-6">
      <StatsFilters value={params} onChange={setParams} />
      <MessagesByProviderStatsPanel params={params} />
    </div>
  )
}