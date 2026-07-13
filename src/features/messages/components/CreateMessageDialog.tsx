import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { TemplatePicker } from '@/features/templates/components/TemplatePicker'
import { useTemplatesPicker } from '@/features/templates/hooks/useTemplatesPicker'
import {
  createMessageFormSchema,
  defaultCreateMessageFormValues,
  type CreateMessageFormValues,
} from '@/features/messages/schemas/message.schema'
import { useCreateMessage } from '@/features/messages/hooks/useCreateMessage'
import {
  isConflictError,
  isValidationError,
  localizeConflictDetail,
  type MailingTemplateRead,
} from '@/shared/api'
import {
  applyValidationErrors,
  mapValidationErrors,
} from '@/shared/api/map-validation-errors'
import { cn } from '@/shared/lib/utils'
import { ActionAlert } from '@/shared/ui/action-alert'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { PhoneInput } from '@/shared/ui/phone-input'
import { Textarea } from '@/shared/ui/textarea'
import { SMS_SEGMENT_LENGTH } from '@/features/mailings/schemas/mailing.schema'

interface CreateMessageDialogProps {
  mailingId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateMessageDialog({
  mailingId,
  open,
  onOpenChange,
  onSuccess,
}: CreateMessageDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const createMessage = useCreateMessage(mailingId)
  const {
    data: templatesData,
    isLoading: isTemplatesLoading,
    isError: isTemplatesError,
  } = useTemplatesPicker()
  const templates = templatesData?.items ?? []

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<CreateMessageFormValues>({
    resolver: zodResolver(createMessageFormSchema),
    defaultValues: defaultCreateMessageFormValues,
  })

  const text = useWatch({ control, name: 'text' }) ?? ''
  const textLength = text.length
  const isOverLimit = textLength > SMS_SEGMENT_LENGTH

  useEffect(() => {
    if (open) {
      reset(defaultCreateMessageFormValues)
      setSubmitError(null)
      setSelectedTemplateId(null)
    }
  }, [open, reset])

  function applyTemplate(template: MailingTemplateRead | null) {
    setSelectedTemplateId(template?.id ?? null)
    if (template) {
      setValue('text', template.text, { shouldValidate: true })
    }
  }

  async function onSubmit(values: CreateMessageFormValues) {
    setSubmitError(null)

    try {
      await createMessage.mutateAsync({
        msisdn: values.msisdn,
        text: values.text.trim(),
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      if (isValidationError(error)) {
        if (error.detailMessage) {
          setSubmitError(error.detailMessage)
          return
        }
        applyValidationErrors(mapValidationErrors(error.details), setError)
        return
      }

      if (isConflictError(error)) {
        setSubmitError(localizeConflictDetail(error.detail))
        return
      }

      setSubmitError(
        error instanceof Error ? error.message : 'Не удалось добавить сообщение',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новое сообщение</DialogTitle>
          <DialogDescription>
            Добавьте получателя и текст SMS в рассылку
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="msisdn"
            render={({ field }) => (
              <PhoneInput
                id="create-message-msisdn"
                label="Номер телефона"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.msisdn?.message}
              />
            )}
          />

          <div className="space-y-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-1 items-center justify-between gap-2">
                <Label htmlFor="create-message-text">Текст SMS</Label>
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
              <TemplatePicker
                id="create-message-template"
                label="Шаблон"
                templates={templates}
                isLoading={isTemplatesLoading}
                isError={isTemplatesError}
                value={selectedTemplateId}
                onChange={applyTemplate}
              />
            </div>
            <Textarea
              id="create-message-text"
              rows={4}
              placeholder="Текст сообщения"
              {...register('text')}
            />
            {errors.text?.message && (
              <p className="text-sm text-destructive">{errors.text.message}</p>
            )}
          </div>

          {submitError && (
            <ActionAlert action="error" entity="message" message={submitError} />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={createMessage.isPending}
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={createMessage.isPending}>
              {createMessage.isPending && <Loader2Icon className="animate-spin" />}
              Добавить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
