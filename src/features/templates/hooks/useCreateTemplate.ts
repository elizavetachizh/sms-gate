import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isValidationError, templatesApi, type MailingTemplateCreate } from '@/shared/api'
import { templateKeys } from '../api/templates.keys'

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: MailingTemplateCreate) => templatesApi.create(payload),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      queryClient.setQueryData(templateKeys.detail(template.id), template)
    },
  })
}

export { isValidationError }
