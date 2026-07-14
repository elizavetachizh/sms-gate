import { PlusIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MsisdnField } from "@/features/mailings/components/messages-editor/MsisdnField";
import { SharedMailingTextField } from "@/features/mailings/components/messages-editor/SharedMailingTextField";
import { getMessagesArrayError } from "@/features/mailings/components/messages-editor/lib";
import type { MailingReplaceFormValues } from "@/features/mailings/schemas/mailing.schema";
import { BELARUS_PHONE_FORMAT } from "@/shared/lib/belarus-phone";
import { Button } from "@/shared/ui/button";

export function SameTextEditor() {
  const {
    control,
    formState: { errors },
  } = useFormContext<MailingReplaceFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "messages",
  });

  const messagesError = getMessagesArrayError(errors.messages);

  return (
    <div className="space-y-6">
      <SharedMailingTextField />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Получатели</h3>
            <p className="text-sm text-muted-foreground">
              Формат: {BELARUS_PHONE_FORMAT}. Минимум один получатель.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ msisdn: "", text: "" })}
          >
            <PlusIcon />
            Добавить номер
          </Button>
        </div>

        {messagesError && (
          <p className="text-sm text-destructive">{messagesError}</p>
        )}

        <div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2 p-2">
              <div className="min-w-0 flex-1">
                <MsisdnField index={index} label={`Номер #${index + 1}`} />
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-7 shrink-0"
                  onClick={() => remove(index)}
                  aria-label={`Удалить номер ${index + 1}`}
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
