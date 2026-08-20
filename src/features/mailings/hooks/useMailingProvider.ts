import { useMemo, useState } from "react";
import { useUpdateMailing } from "@/features/mailings/hooks/useUpdateMailing";
import { useProviders } from "@/features/providers/hooks/useProviders";
import { isValidationError, type ProviderRead } from "@/shared/api";
import { getMutationErrorMessage } from "@/shared/lib/mutation-error";

function withSavedProvider(
  providers: ProviderRead[],
  savedProviderCode: string,
): ProviderRead[] {
  if (
    !savedProviderCode ||
    providers.some((provider) => provider.code === savedProviderCode)
  ) {
    return providers;
  }

  return [
    {
      code: savedProviderCode,
      name: savedProviderCode,
      is_enabled: false,
      max_batch_size: 0,
    },
    ...providers,
  ];
}

export function useMailingProvider(
  mailingId: string,
  savedProviderCode: string,
) {
  const [draft, setDraft] = useState({
    mailingId,
    savedProviderCode,
    providerCode: savedProviderCode,
  });

  if (draft.mailingId !== mailingId) {
    setDraft({ mailingId, savedProviderCode, providerCode: savedProviderCode });
  } else if (draft.savedProviderCode !== savedProviderCode) {
    setDraft({
      mailingId,
      savedProviderCode,
      providerCode:
        draft.providerCode === draft.savedProviderCode
          ? savedProviderCode
          : draft.providerCode,
    });
  }

  const providerCode =
    draft.mailingId === mailingId ? draft.providerCode : savedProviderCode;

  const {
    data: providersData,
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useProviders({ enabled_only: false });
  const updateMailing = useUpdateMailing(mailingId);

  const providers = useMemo(
    () => withSavedProvider(providersData?.items ?? [], savedProviderCode),
    [providersData?.items, savedProviderCode],
  );

  const hasProviderChange =
    providerCode !== savedProviderCode && providerCode !== "";

  const savedProvider = providers.find(
    (provider) => provider.code === savedProviderCode,
  );

  async function saveProvider(): Promise<void> {
    if (!providerCode || !hasProviderChange) return;

    try {
      await updateMailing.updateProvider(providerCode);
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
    setProviderCode: (value: string) =>
      setDraft({ mailingId, savedProviderCode, providerCode: value }),
    hasProviderChange,
    isProvidersLoading,
    isProvidersError,
    isSaving: updateMailing.isPending,
    saveProvider,
  };
}
