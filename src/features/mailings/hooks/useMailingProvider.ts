// TODO: replace sessionStorage fallback with MailingRead.provider_code once the API returns it.
import { useMemo, useState } from "react";
import {
  getStoredMailingProviderCode,
  setStoredMailingProviderCode,
} from "@/features/mailings/lib/mailing-provider-storage";
import { useUpdateMailing } from "@/features/mailings/hooks/useUpdateMailing";
import { useProviders } from "@/features/providers/hooks/useProviders";
import { isValidationError } from "@/shared/api";
import { getMutationErrorMessage } from "@/shared/lib/mutation-error";

function resolveInitialProviderCode(
  mailingId: string,
  providers: { code: string }[],
): string {
  if (!providers.length) {
    return "";
  }

  const stored = getStoredMailingProviderCode(mailingId);
  return stored && providers.some((provider) => provider.code === stored)
    ? stored
    : providers[0].code;
}

export function useMailingProvider(mailingId: string) {
  const [providerCode, setProviderCode] = useState("");
  const [savedProviderCode, setSavedProviderCode] = useState("");
  const [initializedMailingId, setInitializedMailingId] = useState<
    string | null
  >(null);

  const {
    data: providersData,
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useProviders();
  const updateMailing = useUpdateMailing(mailingId);

  const providers = useMemo(
    () => providersData?.items ?? [],
    [providersData?.items],
  );

  // TODO: initialize from mailing.provider_code when available; sessionStorage is a temporary bridge.
  if (providers.length > 0 && initializedMailingId !== mailingId) {
    const initial = resolveInitialProviderCode(mailingId, providers);
    setInitializedMailingId(mailingId);
    setProviderCode(initial);
    setSavedProviderCode(initial);
  }

  const hasProviderChange =
    providerCode !== savedProviderCode && providerCode !== "";

  const savedProvider = providers.find(
    (provider) => provider.code === savedProviderCode,
  );

  async function saveProvider(): Promise<void> {
    if (!providerCode || !hasProviderChange) return;

    try {
      await updateMailing.updateProvider(providerCode);
      setStoredMailingProviderCode(mailingId, providerCode);
      setSavedProviderCode(providerCode);
    } catch (error) {
      if (isValidationError(error) && error.detailMessage) {
        throw new Error(error.detailMessage, { cause: error });
      }

      throw new Error(
        getMutationErrorMessage(error, "Не удалось сохранить провайдера"),
        { cause: error },
      );
    }
  }

  return {
    providers,
    providerCode,
    savedProviderCode,
    savedProvider,
    setProviderCode,
    hasProviderChange,
    isProvidersLoading,
    isProvidersError,
    isSaving: updateMailing.isPending,
    saveProvider,
  };
}
