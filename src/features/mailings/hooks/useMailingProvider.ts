import { useEffect, useState } from "react";
import {
  getStoredMailingProviderCode,
  setStoredMailingProviderCode,
} from "@/features/mailings/lib/mailing-provider-storage";
import { useUpdateMailing } from "@/features/mailings/hooks/useUpdateMailing";
import { useProviders } from "@/features/providers/hooks/useProviders";
import { isValidationError } from "@/shared/api";
import { getMutationErrorMessage } from "@/shared/lib/mutation-error";

export function useMailingProvider(mailingId: string) {
  const [providerCode, setProviderCode] = useState("");
  const [savedProviderCode, setSavedProviderCode] = useState("");

  const {
    data: providersData,
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useProviders();
  const updateMailing = useUpdateMailing(mailingId);

  const providers = providersData?.items ?? [];
  const hasProviderChange =
    providerCode !== savedProviderCode && providerCode !== "";

  const savedProvider = providers.find(
    (provider) => provider.code === savedProviderCode,
  );

  useEffect(() => {
    if (!providers.length) return;

    const stored = getStoredMailingProviderCode(mailingId);
    const initial =
      stored && providers.some((provider) => provider.code === stored)
        ? stored
        : providers[0].code;

    setProviderCode(initial);
    setSavedProviderCode(initial);
  }, [mailingId, providers]);

  async function saveProvider(): Promise<void> {
    if (!providerCode || !hasProviderChange) return;

    try {
      await updateMailing.updateProvider(providerCode);
      setStoredMailingProviderCode(mailingId, providerCode);
      setSavedProviderCode(providerCode);
    } catch (error) {
      if (isValidationError(error) && error.detailMessage) {
        throw new Error(error.detailMessage);
      }

      throw new Error(
        getMutationErrorMessage(error, "Не удалось сохранить провайдера"),
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
