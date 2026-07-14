import { useFormContext, useWatch } from "react-hook-form";
import { MailingTemplatePicker } from "@/features/mailings/components/messages-editor/MailingTemplatePicker";
import type { MailingReplaceFormValues } from "@/features/mailings/schemas/mailing.schema";
import { SmsTextField } from "@/shared/ui/sms-text-field";

export function SharedMailingTextField() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<MailingReplaceFormValues>();

  const sharedText = useWatch({ control, name: "shared_text" }) ?? "";
  const sharedTextError = errors.shared_text?.message;

  return (
    <SmsTextField
      id="shared_text"
      value={sharedText}
      error={sharedTextError}
      placeholder="Текст сообщения для всех получателей"
      rows={4}
      {...register("shared_text")}
      templatePicker={
        <MailingTemplatePicker
          id="shared-template"
          hideWhenEmpty
          className="sm:w-48"
          onApplyText={(templateText) =>
            setValue("shared_text", templateText, { shouldValidate: true })
          }
        />
      }
    />
  );
}
