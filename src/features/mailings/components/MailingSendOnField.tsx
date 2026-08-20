import { Loader2Icon } from "lucide-react";
import type { useMailingSendOn } from "@/features/mailings/hooks/useMailingSendOn";
import { formatDateTime } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

type MailingSendOnState = ReturnType<typeof useMailingSendOn>;

interface MailingSendOnFieldProps {
  canEdit: boolean;
  sendOnState: MailingSendOnState;
  disabled?: boolean;
  onUpdated?: () => void;
  onError?: (message: string) => void;
}

export function MailingSendOnField({
  canEdit,
  sendOnState,
  disabled = false,
  onUpdated,
  onError,
}: MailingSendOnFieldProps) {
  const { sendOn, setSendOn, savedIso, canSave, isSaving, saveSendOn } =
    sendOnState;

  async function handleSave() {
    try {
      await saveSendOn();
      onUpdated?.();
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить дату отправки",
      );
    }
  }

  if (!canEdit) {
    if (!savedIso) {
      return (
        <p className="text-sm text-muted-foreground">Сразу (текущее UTC)</p>
      );
    }

    return <p className="text-sm">{formatDateTime(savedIso)}</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          id="mailing-send-on"
          type="datetime-local"
          step={60}
          className="max-w-xs"
          value={sendOn}
          disabled={disabled || isSaving}
          onChange={(event) => setSendOn(event.target.value)}
        />
        <Button
          type="button"
          size="sm"
          disabled={disabled || isSaving || !canSave}
          onClick={() => void handleSave()}
        >
          {isSaving && <Loader2Icon className="animate-spin" />}
          Сохранить
        </Button>
      </div>
      <Label htmlFor="mailing-send-on" className="sr-only">
        Дата и время отправки
      </Label>
      <p className="text-sm text-muted-foreground">
        "Пустое значение — сразу (текущее UTC)."
      </p>
    </div>
  );
}
