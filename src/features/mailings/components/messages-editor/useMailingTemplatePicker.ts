import { useCallback, useState } from 'react'
import { useTemplatesPicker } from '@/features/templates/hooks/useTemplatesPicker'
import type { MailingTemplateRead } from '@/shared/api'

export function useMailingTemplatePicker(onApplyText: (text: string) => void) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const {
    data: templatesData,
    isLoading,
    isError,
  } = useTemplatesPicker()

  const templates = templatesData?.items ?? []

  const applyTemplate = useCallback(
    (template: MailingTemplateRead | null) => {
      setSelectedTemplateId(template?.id ?? null)
      if (template) {
        onApplyText(template.text)
      }
    },
    [onApplyText],
  )

  const resetSelection = useCallback(() => {
    setSelectedTemplateId(null)
  }, [])

  return {
    templates,
    isLoading,
    isError,
    selectedTemplateId,
    applyTemplate,
    resetSelection,
  }
}
