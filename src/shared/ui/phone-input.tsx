import { type ComponentProps } from 'react'
import {
  BELARUS_PHONE_PLACEHOLDER,
  formatBelarusPhone,
  normalizeBelarusPhoneDigits,
} from '@/shared/lib/belarus-phone'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface PhoneInputProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
}

export function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  label,
  error,
  className,
  disabled,
  ...props
}: PhoneInputProps) {
  const displayValue = formatBelarusPhone(value)

  function handleChange(nextValue: string) {
    onChange(normalizeBelarusPhoneDigits(nextValue))
  }

  return (
    <div className={cn(label ? 'space-y-2' : undefined, className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder={BELARUS_PHONE_PLACEHOLDER}
        value={displayValue}
        disabled={disabled}
        aria-invalid={Boolean(error) || props['aria-invalid']}
        onBlur={onBlur}
        onChange={(event) => handleChange(event.target.value)}
        {...props}
      />
      {error ? <p className="mt-1.5 text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
