import { PlusIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MsisdnField } from "@/features/mailings/components/messages-editor/MsisdnField";
import { getMessagesArrayError } from "@/features/mailings/components/messages-editor/lib";
import {
  defaultMessageValues,
  type MailingReplaceFormValues,
} from "@/features/mailings/schemas/mailing.schema";
import { BELARUS_PHONE_FORMAT } from "@/shared/lib/belarus-phone";
import { SMS_TEXT_MAX_LENGTH } from "@/shared/lib/sms-text";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MailingMessageTextField } from "./MailingMessageTextField";

export function DifferentTextEditor() {
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Сообщения</h3>
            <Badge variant="muted">{fields.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Номер: {BELARUS_PHONE_FORMAT}. Текст: до {SMS_TEXT_MAX_LENGTH}{" "}
            символов.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(defaultMessageValues)}
        >
          <PlusIcon />
          Добавить SMS
        </Button>
      </div>

      {messagesError && (
        <p className="text-sm text-destructive">{messagesError}</p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <article
            key={field.id}
            className="space-y-3 rounded-md border bg-background p-3 sm:p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">SMS #{index + 1}</span>
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label={`Удалить SMS ${index + 1}`}
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              )}
            </div>

            <MsisdnField index={index} label="Номер телефона" />
            <MailingMessageTextField index={index} />
          </article>
        ))}
      </div>
    </div>
  );
}
