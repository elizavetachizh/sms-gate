import { PlusIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MsisdnField } from "@/features/mailings/components/messages-editor/MsisdnField";
import { SharedMailingTextField } from "@/features/mailings/components/messages-editor/SharedMailingTextField";
import { getMessagesArrayError } from "@/features/mailings/components/messages-editor/lib";
import type { MailingReplaceFormValues } from "@/features/mailings/schemas/mailing.schema";
import { BELARUS_PHONE_FORMAT } from "@/shared/lib/belarus-phone";
import { Badge } from "@/shared/ui/badge";
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
    <div className="space-y-5">
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Текст сообщения</h3>
          <p className="text-sm text-muted-foreground">
            Этот текст получат все номера из списка ниже
          </p>
        </div>
        <SharedMailingTextField />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Получатели</h3>
              <Badge variant="muted">{fields.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Формат: {BELARUS_PHONE_FORMAT}
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

        <div className="overflow-hidden rounded-md border bg-background">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-start gap-2 border-b px-3 py-2.5 last:border-b-0"
            >
              <span
                className="mt-2.5 w-6 shrink-0 text-center text-xs tabular-nums text-muted-foreground"
                aria-hidden
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <MsisdnField
                  index={index}
                  label={`Номер ${index + 1}`}
                  hideLabel
                />
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 shrink-0"
                  onClick={() => remove(index)}
                  aria-label={`Удалить номер ${index + 1}`}
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
