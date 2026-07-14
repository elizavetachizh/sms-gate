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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Сообщения</h3>
          <p className="text-sm text-muted-foreground">
            Минимум одно SMS. Номер: {BELARUS_PHONE_FORMAT}. Текст: до{" "}
            {SMS_TEXT_MAX_LENGTH} символов.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(defaultMessageValues)}
        >
          <PlusIcon />
          Добавить
        </Button>
      </div>

      {messagesError && (
        <p className="text-sm text-destructive">{messagesError}</p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-3 rounded-lg border bg-background p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SMS #{index + 1}</span>
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

            <MsisdnField
              index={index}
              label="Номер телефона"
              className="mb-3"
            />
            <MailingMessageTextField index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
