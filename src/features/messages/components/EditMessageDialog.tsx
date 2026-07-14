import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { TemplatePicker } from '@/features/templates/components/TemplatePicker'
import { useTemplatesPicker } from '@/features/templates/hooks/useTemplatesPicker'
import {
  createMessageFormSchema,
  type CreateMessageFormValues,
} from '@/features/messages/schemas/message.schema'
import {
  isValidationError,
  useUpdateMessage,
} from '@/features/messages/hooks/useUpdateMessage'
import {
  isConflictError,
  localizeConflictDetail,
  type MailingTemplateRead,
  type MessageRead,
} from '@/shared/api'
import {
  applyValidationErrors,
  mapValidationErrors,
} from '@/shared/api/map-validation-errors'
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
import { PhoneInput } from '@/shared/ui/phone-input'
import { SmsTextField } from '@/shared/ui/sms-text-field'

interface EditMessageDialogProps {
  mailingId: string
  message: MessageRead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function getEditFormValues(message: MessageRead): CreateMessageFormValues {
  return {
    msisdn: message.msisdn,
    text: message.text,
  }
}

export function EditMessageDialog({
  mailingId,
  message,
  open,
  onOpenChange,
  onSuccess,
}: EditMessageDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const updateMessage = useUpdateMessage(mailingId)
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
    defaultValues: { msisdn: '', text: '' },
  })

  const text = useWatch({ control, name: 'text' }) ?? ''

  useEffect(() => {
    if (open && message) {
      reset(getEditFormValues(message))
      setSubmitError(null)
      setSelectedTemplateId(null)
    }
  }, [open, message, reset])

  function applyTemplate(template: MailingTemplateRead | null) {
    setSelectedTemplateId(template?.id ?? null)
    if (template) {
      setValue('text', template.text, { shouldValidate: true })
    }
  }

  async function onSubmit(values: CreateMessageFormValues) {
    if (!message) return

    setSubmitError(null)

    try {
      await updateMessage.mutateAsync({
        messageId: message.id,
        body: {
          msisdn: values.msisdn,
          text: values.text.trim(),
        },
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
        error instanceof Error ? error.message : 'Не удалось сохранить сообщение',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактирование сообщения</DialogTitle>
          <DialogDescription>
            Измените номер получателя или текст SMS
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="msisdn"
            render={({ field }) => (
              <PhoneInput
                id="edit-message-msisdn"
                label="Номер телефона"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.msisdn?.message}
              />
            )}
          />

          <SmsTextField
            id="edit-message-text"
            value={text}
            error={errors.text?.message}
            rows={4}
            {...register('text')}
            templatePicker={
              <TemplatePicker
                id="edit-message-template"
                label="Шаблон"
                templates={templates}
                isLoading={isTemplatesLoading}
                isError={isTemplatesError}
                value={selectedTemplateId}
                onChange={applyTemplate}
              />
            }
          />

          {submitError && (
            <ActionAlert action="error" entity="message" message={submitError} />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={updateMessage.isPending}
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={updateMessage.isPending || !message}>
              {updateMessage.isPending && <Loader2Icon className="animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
