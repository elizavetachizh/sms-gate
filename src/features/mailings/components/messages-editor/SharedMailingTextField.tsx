import type { MailingReplaceFormValues } from "@/features/mailings/schemas/mailing.schema";
import { MailingTextField } from "./MailingTextField";

export function SharedMailingTextField() {
  return (
    <MailingTextField<MailingReplaceFormValues>
      name="shared_text"
      id="shared_text"
      templatePickerId="shared-template"
      placeholder="Текст сообщения для всех получателей"
      rows={4}
      hideTemplateWhenEmpty
      pickerClassName="sm:w-48"
    />
  );
}
