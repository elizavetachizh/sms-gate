import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mailingsApi,
  type MailingCreate,
  isValidationError,
} from "@/shared/api";
import { mailingKeys } from "../api/mailings.keys";
import { setStoredMailingProviderCode } from "../lib/mailing-provider-storage";

export function useCreateMailing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MailingCreate) => mailingsApi.create(payload),
    onSuccess: (mailing, variables) => {
      setStoredMailingProviderCode(mailing.id, variables.provider_code);
      queryClient.invalidateQueries({ queryKey: mailingKeys.lists() });
      queryClient.setQueryData(mailingKeys.detail(mailing.id), mailing);
    },
  });
}

export { isValidationError };
