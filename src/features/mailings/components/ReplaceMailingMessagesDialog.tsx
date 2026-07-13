import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { MessagesEditor } from '@/features/mailings/components/MessagesEditor'
import { buildMailingMessagesPayload } from '@/features/mailings/lib/build-mailing-messages-payload'
import { messagesToReplaceFormValues } from '@/features/mailings/lib/messages-to-replace-form-values'
import { useUpdateMailing } from '@/features/mailings/hooks/useUpdateMailing'
import {
  defaultMailingReplaceFormValues,
  mailingReplaceSchema,
  type MailingReplaceFormValues,
} from '@/features/mailings/schemas/mailing.schema'
import {
  isConflictError,
  isValidationError,
  localizeConflictDetail,
  type MessageRead,
} from '@/shared/api'
import {
  applyValidationErrors,
  mapValidationErrors,
} from '@/shared/api/map-validation-errors'
import { getMutationErrorMessage } from '@/shared/lib/mutation-error'
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

interface ReplaceMailingMessagesDialogProps {
  mailingId: string
  providerCode: string
  messages: MessageRead[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReplaceMailingMessagesDialog({
  mailingId,
  providerCode,
  messages,
  open,
  onOpenChange,
  onSuccess,
}: ReplaceMailingMessagesDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const updateMailing = useUpdateMailing(mailingId)

  const form = useForm<MailingReplaceFormValues>({
    resolver: zodResolver(mailingReplaceSchema),
    defaultValues: defaultMailingReplaceFormValues,
  })

  const { handleSubmit, reset, setError } = form

  useEffect(() => {
    if (!open) return

    setSubmitError(null)
    reset(messagesToReplaceFormValues(messages))
  }, [open, messages, reset])

  async function onSubmit(values: MailingReplaceFormValues) {
    setSubmitError(null)

    try {
      await updateMailing.replaceMessages(
        providerCode,
        buildMailingMessagesPayload(values),
      )
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      if (isValidationError(error)) {
        applyValidationErrors(mapValidationErrors(error.details), setError)
        return
      }

      if (isConflictError(error)) {
        setSubmitError(localizeConflictDetail(error.detail))
        return
      }

      setSubmitError(
        getMutationErrorMessage(error, 'Не удалось заменить список получателей'),
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Заменить список получателей</DialogTitle>
          <DialogDescription>
            Текущий список будет полностью заменён. Старые сообщения удалятся,
            новым будут присвоены новые ID.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <MessagesEditor />

            {submitError && (
              <ActionAlert action="error" entity="mailing" message={submitError} />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={updateMailing.isPending}
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={updateMailing.isPending}>
                {updateMailing.isPending ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Сохранение…
                  </>
                ) : (
                  'Заменить список'
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
