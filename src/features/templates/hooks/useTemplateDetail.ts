import { useQuery } from '@tanstack/react-query'
import { templatesApi } from '@/shared/api'
import { templateKeys } from '../api/templates.keys'

export function useTemplateDetail(templateId: string) {
  return useQuery({
    queryKey: templateKeys.detail(templateId),
    queryFn: () => templatesApi.getById(templateId),
  })
}
