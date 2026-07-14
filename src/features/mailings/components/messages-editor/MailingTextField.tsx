import { SmsTextField } from "@/shared/ui/sms-text-field";
import {
  get,
  useFormContext,
  useWatch,
  type FieldPath,
  type FieldValues,
  type PathValue,
} from "react-hook-form";
import { MailingTemplatePicker } from "./MailingTemplatePicker";

interface MailingTextFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  id: string;
  templatePickerId: string;
  rows?: number;
  placeholder?: string;
  hideTemplateWhenEmpty?: boolean;
  pickerClassName?: string;
}

export function MailingTextField<T extends FieldValues>({
  name,
  id,
  templatePickerId,
  rows,
  placeholder,
  hideTemplateWhenEmpty,
  pickerClassName,
}: MailingTextFieldProps<T>) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<T>();

  const text = useWatch({ control, name }) ?? "";
  const error = get(errors, name)?.message;

  return (
    <SmsTextField
      id={id}
      value={text}
      error={error}
      rows={rows}
      placeholder={placeholder}
      {...register(name)}
      templatePicker={
        <MailingTemplatePicker
          id={templatePickerId}
          hideWhenEmpty={hideTemplateWhenEmpty}
          className={pickerClassName}
          onApplyText={(templateText) =>
            setValue(name, templateText as PathValue<T, FieldPath<T>>, {
              shouldValidate: true,
            })
          }
        />
      }
    />
  );
}
