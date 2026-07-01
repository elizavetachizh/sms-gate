import { useTemplatesList } from '@/features/templates/hooks/useTemplatesList'

const PICKER_LIST_PARAMS = { limit: 500, offset: 0 }

export function useTemplatesPicker() {
  return useTemplatesList(PICKER_LIST_PARAMS)
}
