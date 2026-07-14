import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi, type MailingRead } from "@/shared/api";
import { mailingKeys } from "@/features/mailings/api/mailings.keys";

export function useDeleteMessage(mailingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messagesApi.delete(mailingId, messageId),
    onSuccess: (_result, messageId) => {
      queryClient.setQueryData<MailingRead>(
        mailingKeys.detail(mailingId),
        (mailing) =>
          mailing
            ? {
                ...mailing,
                messages: mailing.messages.filter(
                  (message) => message.id !== messageId,
                ),
              }
            : mailing,
      );
    },
  });
}
