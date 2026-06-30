import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import {
  defaultMessageValues,
  SMS_SEGMENT_LENGTH,
  type MailingCreateFormValues,
} from '@/features/mailings/schemas/mailing.schema'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

function MessageTextField({ index }: { index: number }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<MailingCreateFormValues>()

  const text = useWatch({ control, name: `messages.${index}.text` }) ?? ''
  const length = text.length
  const textError = errors.messages?.[index]?.text?.message
  const isOverLimit = length > SMS_SEGMENT_LENGTH

  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`messages.${index}.text`}>Текст SMS</Label>
        <span
          className={cn(
            'text-xs tabular-nums',
            isOverLimit ? 'font-medium text-destructive' : 'text-muted-foreground',
          )}
          aria-live="polite"
        >
          {length}/{SMS_SEGMENT_LENGTH}
        </span>
      </div>
      <Textarea
        id={`messages.${index}.text`}
        placeholder="Текст сообщения"
        rows={3}
        aria-invalid={Boolean(textError)}
        {...register(`messages.${index}.text`)}
      />
      {textError && <p className="text-sm text-destructive">{textError}</p>}
    </div>
  )
}

export function MessagesEditor() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<MailingCreateFormValues>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'messages',
  })

  const messagesError =
    errors.messages?.root?.message ??
    (typeof errors.messages?.message === 'string' ? errors.messages.message : undefined)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Сообщения</h3>
          <p className="text-sm text-muted-foreground">
            Минимум одно SMS. Номер: 9–16 символов. Текст: до {SMS_SEGMENT_LENGTH} символов.
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
        {fields.map((field, index) => {
          const msisdnError = errors.messages?.[index]?.msisdn?.message

          return (
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`messages.${index}.msisdn`}>Номер телефона</Label>
                  <Input
                    id={`messages.${index}.msisdn`}
                    placeholder="+375 29 123-45-67"
                    aria-invalid={Boolean(msisdnError)}
                    {...register(`messages.${index}.msisdn`)}
                  />
                  {msisdnError && (
                    <p className="text-sm text-destructive">{msisdnError}</p>
                  )}
                </div>

                <MessageTextField index={index} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
