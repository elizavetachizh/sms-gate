import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mailingsApi,
  type MailingCreateMessage,
  type MailingUpdate,
} from "@/shared/api";
import { mailingKeys } from "../api/mailings.keys";

export function useUpdateMailing(mailingId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (body: MailingUpdate) => mailingsApi.update(mailingId, body),
    onSuccess: (mailing) => {
      queryClient.setQueryData(mailingKeys.detail(mailingId), mailing);
      queryClient.invalidateQueries({ queryKey: mailingKeys.lists() });
    },
  });

  return {
    ...mutation,
    updateProvider: (provider_code: string) =>
      mutation.mutateAsync({ provider_code }),
    clearMessages: (provider_code: string) =>
      mutation.mutateAsync({ provider_code, messages: [] }),
    replaceMessages: (
      provider_code: string,
      messages: MailingCreateMessage[],
    ) => mutation.mutateAsync({ provider_code, messages }),
  };
}
