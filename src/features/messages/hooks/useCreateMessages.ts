import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  messagesApi,
  type MailingCreateMessage,
  type MailingRead,
} from "@/shared/api";
import { mailingKeys } from "@/features/mailings/api/mailings.keys";

export function useCreateMessages(mailingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bodies: MailingCreateMessage[]) => {
      const created = [];

      for (const body of bodies) {
        created.push(await messagesApi.create(mailingId, body));
      }

      return created;
    },
    onSuccess: (newMessages) => {
      queryClient.setQueryData<MailingRead>(
        mailingKeys.detail(mailingId),
        (mailing) =>
          mailing
            ? { ...mailing, messages: [...mailing.messages, ...newMessages] }
            : mailing,
      );
    },
  });
}
