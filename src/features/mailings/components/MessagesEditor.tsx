import { useState } from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { TemplatePicker } from '@/features/templates/components/TemplatePicker'
import { useTemplatesPicker } from '@/features/templates/hooks/useTemplatesPicker'
import {
  defaultMessageValues,
  SMS_SEGMENT_LENGTH,
  type MailingCreateFormValues,
  type MailingTextMode,
} from '@/features/mailings/schemas/mailing.schema'
import type { MailingTemplateRead } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

const TEXT_MODE_OPTIONS: { value: MailingTextMode; label: string; description: string }[] = [
  {
    value: 'same',
    label: 'Один текст',
    description: 'Один SMS всем получателям — укажите текст и список номеров',
  },
  {
    value: 'different',
    label: 'Разный текст',
    description: 'У каждого получателя свой текст сообщения',
  },
]

function MessageTextField({ index }: { index: number }) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<MailingCreateFormValues>()

  const {
    data: templatesData,
    isLoading: isTemplatesLoading,
    isError: isTemplatesError,
  } = useTemplatesPicker()
  const templates = templatesData?.items ?? []

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const text = useWatch({ control, name: `messages.${index}.text` }) ?? ''
  const length = text.length
  const textError = errors.messages?.[index]?.text?.message
  const isOverLimit = length > SMS_SEGMENT_LENGTH

  function applyTemplate(template: MailingTemplateRead | null) {
    setSelectedTemplateId(template?.id ?? null)
    if (template) {
      setValue(`messages.${index}.text`, template.text, { shouldValidate: true })
    }
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center justify-between gap-2 sm:flex-1">
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
        <TemplatePicker
          id={`messages.${index}.template`}
          label="Шаблон"
          templates={templates}
          isLoading={isTemplatesLoading}
          isError={isTemplatesError}
          value={selectedTemplateId}
          onChange={applyTemplate}
          className="sm:w-48"
        />
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

function SameTextEditor() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<MailingCreateFormValues>()

  const {
    data: templatesData,
    isLoading: isTemplatesLoading,
    isError: isTemplatesError,
  } = useTemplatesPicker()
  const templates = templatesData?.items ?? []

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'messages',
  })

  const sharedText = useWatch({ control, name: 'shared_text' }) ?? ''
  const textLength = sharedText.length
  const isOverLimit = textLength > SMS_SEGMENT_LENGTH
  const sharedTextError = errors.shared_text?.message

  const messagesError =
    errors.messages?.root?.message ??
    (typeof errors.messages?.message === 'string' ? errors.messages.message : undefined)

  function applyTemplate(template: MailingTemplateRead | null) {
    setSelectedTemplateId(template?.id ?? null)
    if (template) {
      setValue('shared_text', template.text, { shouldValidate: true })
    }
  }

  function addRecipient() {
    append({ msisdn: '', text: '' })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center justify-between gap-2 sm:flex-1">
            <Label htmlFor="shared_text">Текст SMS</Label>
            <span
              className={cn(
                'text-xs tabular-nums',
                isOverLimit ? 'font-medium text-destructive' : 'text-muted-foreground',
              )}
              aria-live="polite"
            >
              {textLength}/{SMS_SEGMENT_LENGTH}
            </span>
          </div>
          {templates.length > 0 && (
            <TemplatePicker
              id="shared-template"
              label="Шаблон"
              templates={templates}
              isLoading={isTemplatesLoading}
              isError={isTemplatesError}
              value={selectedTemplateId}
              onChange={applyTemplate}
              className="sm:w-48"
            />
          )}
        </div>
        <Textarea
          id="shared_text"
          placeholder="Текст сообщения для всех получателей"
          rows={4}
          aria-invalid={Boolean(sharedTextError)}
          {...register('shared_text')}
        />
        {sharedTextError && (
          <p className="text-sm text-destructive">{sharedTextError}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Получатели</h3>
            <p className="text-sm text-muted-foreground">
              Номер: 9–16 символов. Минимум один получатель.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addRecipient}>
            <PlusIcon />
            Добавить номер
          </Button>
        </div>

        {messagesError && (
          <p className="text-sm text-destructive">{messagesError}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => {
            const msisdnError = errors.messages?.[index]?.msisdn?.message

            return (
              <div
                key={field.id}
                className="flex items-start gap-3 rounded-lg border bg-background p-4"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor={`messages.${index}.msisdn`}>
                    Номер #{index + 1}
                  </Label>
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

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-7 shrink-0"
                    onClick={() => remove(index)}
                    aria-label={`Удалить номер ${index + 1}`}
                  >
                    <Trash2Icon className="text-destructive" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DifferentTextEditor() {
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

export function MessagesEditor() {
  const { control, getValues, setValue } = useFormContext<MailingCreateFormValues>()
  const textMode = useWatch({ control, name: 'text_mode' })

  function handleModeChange(nextMode: MailingTextMode) {
    if (nextMode === textMode) return

    const messages = getValues('messages')
    const sharedText = getValues('shared_text')

    if (nextMode === 'same') {
      const text =
        sharedText.trim() ||
        messages.find((message) => message.text.trim())?.text ||
        ''

      setValue('shared_text', text, { shouldValidate: false })
      setValue(
        'messages',
        messages.map((message) => ({ msisdn: message.msisdn, text: '' })),
        { shouldValidate: false },
      )
    } else {
      const text = sharedText.trim()

      setValue(
        'messages',
        messages.map((message) => ({
          msisdn: message.msisdn,
          text: text || message.text,
        })),
        { shouldValidate: false },
      )
    }

    setValue('text_mode', nextMode, { shouldValidate: false })
  }

  const activeOption = TEXT_MODE_OPTIONS.find((option) => option.value === textMode)

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Текст сообщений</Label>
        <div className="flex flex-wrap gap-2">
          {TEXT_MODE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={textMode === option.value ? 'default' : 'outline'}
              onClick={() => handleModeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {activeOption && (
          <p className="text-sm text-muted-foreground">{activeOption.description}</p>
        )}
      </div>

      {textMode === 'same' ? <SameTextEditor /> : <DifferentTextEditor />}
    </div>
  )
}
