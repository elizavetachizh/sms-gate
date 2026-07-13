import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  isValidationError,
  messagesApi,
  type MailingCreateMessage,
  type MailingRead,
} from '@/shared/api'
import { mailingKeys } from '@/features/mailings/api/mailings.keys'

export function useCreateMessage(mailingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: MailingCreateMessage) =>
      messagesApi.create(mailingId, body),
    onSuccess: (message) => {
      queryClient.setQueryData<MailingRead>(
        mailingKeys.detail(mailingId),
        (mailing) =>
          mailing
            ? { ...mailing, messages: [...mailing.messages, message] }
            : mailing,
      )
    },
  })
}

export { isValidationError }
