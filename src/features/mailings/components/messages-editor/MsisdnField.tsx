import { Controller, useFormContext } from 'react-hook-form'
import type { MailingReplaceFormValues } from '@/features/mailings/schemas/mailing.schema'
import { PhoneInput } from '@/shared/ui/phone-input'

interface MsisdnFieldProps {
  index: number
  label: string
  className?: string
}

export function MsisdnField({ index, label, className }: MsisdnFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<MailingReplaceFormValues>()

  const error = errors.messages?.[index]?.msisdn?.message

  return (
    <Controller
      control={control}
      name={`messages.${index}.msisdn`}
      render={({ field }) => (
        <PhoneInput
          id={`messages.${index}.msisdn`}
          label={label}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={error}
          className={className}
        />
      )}
    />
  )
}
