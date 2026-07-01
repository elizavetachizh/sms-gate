import { useQuery } from '@tanstack/react-query'
import { templatesApi, type TemplateListParams } from '@/shared/api'
import { templateKeys } from '../api/templates.keys'

export function useTemplatesList(params: TemplateListParams) {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => templatesApi.list(params),
  })
}
