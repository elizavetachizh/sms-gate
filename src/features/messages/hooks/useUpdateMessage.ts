import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  isValidationError,
  messagesApi,
  type MailingCreateMessage,
  type MailingRead,
} from "@/shared/api";
import { mailingKeys } from "@/features/mailings/api/mailings.keys";

export function useUpdateMessage(mailingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      body,
    }: {
      messageId: string;
      body: MailingCreateMessage;
    }) => messagesApi.update(mailingId, messageId, body),
    onSuccess: (updatedMessage) => {
      queryClient.setQueryData<MailingRead>(
        mailingKeys.detail(mailingId),
        (mailing) =>
          mailing
            ? {
                ...mailing,
                messages: mailing.messages.map((message) =>
                  message.id === updatedMessage.id ? updatedMessage : message,
                ),
              }
            : mailing,
      );
    },
  });
}

export { isValidationError };
