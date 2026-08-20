import { useState } from "react";
import { useUpdateMailing } from "@/features/mailings/hooks/useUpdateMailing";
import {
  toDatetimeLocalValue,
  toMailingSendOnIso,
} from "@/features/mailings/lib/send-on";
import { isValidationError } from "@/shared/api";
import { getMutationErrorMessage } from "@/shared/lib/mutation-error";

export function useMailingSendOn(
  mailingId: string,
  savedProviderCode: string,
  mailingName: string,
  sendOnValue?: string | null,
) {
  const savedLocal = toDatetimeLocalValue(sendOnValue);
  const [draft, setDraft] = useState({
    mailingId,
    savedLocal,
    sendOn: savedLocal,
  });

  if (draft.mailingId !== mailingId) {
    setDraft({ mailingId, savedLocal, sendOn: savedLocal });
  } else if (draft.savedLocal !== savedLocal) {
    setDraft({
      mailingId,
      savedLocal,
      sendOn: draft.sendOn === draft.savedLocal ? savedLocal : draft.sendOn,
    });
  }

  const sendOn = draft.mailingId === mailingId ? draft.sendOn : savedLocal;
  const updateMailing = useUpdateMailing(mailingId);

  const hasChange = sendOn !== savedLocal;
  const canSave = hasChange && savedProviderCode !== "" && mailingName !== "";

  async function saveSendOn(): Promise<void> {
    if (!canSave) return;

    try {
      await updateMailing.updateSendOn(
        savedProviderCode,
        mailingName,
        toMailingSendOnIso(sendOn),
      );
    } catch (error) {
      if (isValidationError(error) && error.detailMessage) {
        throw new Error(error.detailMessage, { cause: error });
      }

      throw new Error(
        getMutationErrorMessage(error, "Не удалось сохранить дату отправки"),
        { cause: error },
      );
    }
  }

  return {
    sendOn,
    setSendOn: (value: string) =>
      setDraft({ mailingId, savedLocal, sendOn: value }),
    savedIso: sendOnValue,
    hasChange,
    canSave,
    isSaving: updateMailing.isPending,
    saveSendOn,
  };
}
