import { useMutation, useQueryClient } from '@tanstack/react-query'
import { templatesApi } from '@/shared/api'
import { templateKeys } from '../api/templates.keys'

export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => templatesApi.delete(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}
