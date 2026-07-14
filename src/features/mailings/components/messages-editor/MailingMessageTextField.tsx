import { useFormContext, useWatch } from 'react-hook-form'
import { MailingTemplatePicker } from '@/features/mailings/components/messages-editor/MailingTemplatePicker'
import type { MailingReplaceFormValues } from '@/features/mailings/schemas/mailing.schema'
import { SmsTextField } from '@/shared/ui/sms-text-field'

interface MailingMessageTextFieldProps {
  index: number
  rows?: number
}

export function MailingMessageTextField({
  index,
  rows = 3,
}: MailingMessageTextFieldProps) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<MailingReplaceFormValues>()

  const text = useWatch({ control, name: `messages.${index}.text` }) ?? ''
  const textError = errors.messages?.[index]?.text?.message

  return (
    <SmsTextField
      id={`messages.${index}.text`}
      value={text}
      error={textError}
      rows={rows}
      {...register(`messages.${index}.text`)}
      templatePicker={
        <MailingTemplatePicker
          id={`messages.${index}.template`}
          className="sm:w-48"
          onApplyText={(templateText) =>
            setValue(`messages.${index}.text`, templateText, {
              shouldValidate: true,
            })
          }
        />
      }
    />
  )
}
