import { useMutation, useQueryClient } from '@tanstack/react-query'
import { templatesApi, type MailingTemplateUpdate } from '@/shared/api'
import { templateKeys } from '../api/templates.keys'

export function useUpdateTemplate(templateId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: MailingTemplateUpdate) =>
      templatesApi.update(templateId, payload),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      queryClient.setQueryData(templateKeys.detail(template.id), template)
    },
  })
}
