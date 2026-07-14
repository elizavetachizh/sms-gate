import { useQuery } from '@tanstack/react-query'
import { servicesKeys } from '@/features/services/api/services.keys'
import { servicesApi } from '@/shared/api'
import { SMS_TEXT_MAX_LENGTH } from '@/shared/lib/sms-text'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

const ANALYZE_DEBOUNCE_MS = 300

export function useSmsTextAnalysis(text: string) {
  const trimmedText = text.trim()
  const debouncedText = useDebouncedValue(trimmedText, ANALYZE_DEBOUNCE_MS)
  const canAnalyze =
    debouncedText.length >= 1 && debouncedText.length <= SMS_TEXT_MAX_LENGTH

  return useQuery({
    queryKey: servicesKeys.analyzeText(debouncedText),
    queryFn: () => servicesApi.analyzeText({ text: debouncedText }),
    enabled: canAnalyze,
    staleTime: 60_000,
    retry: false,
    placeholderData: (previousData) => previousData,
  })
}
