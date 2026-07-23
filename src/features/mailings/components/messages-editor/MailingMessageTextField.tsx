import type { MailingReplaceFormValues } from "@/features/mailings/schemas/mailing.schema";
import { MailingTextField } from "./MailingTextField";

interface MailingMessageTextFieldProps {
  index: number;
  rows?: number;
}

export function MailingMessageTextField({
  index,
  rows = 3,
}: MailingMessageTextFieldProps) {
  return (
    <MailingTextField<MailingReplaceFormValues>
      name={`messages.${index}.text`}
      id={`messages.${index}.text`}
      templatePickerId={`messages.${index}.template`}
      rows={rows}
      pickerClassName="sm:w-48"
    />
  );
}
