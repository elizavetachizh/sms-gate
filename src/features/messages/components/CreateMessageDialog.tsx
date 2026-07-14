import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { MessagesEditor } from '@/features/mailings/components/messages-editor'
import { buildMailingMessagesPayload } from '@/features/mailings/lib/build-mailing-messages-payload'
import {
  defaultMailingReplaceFormValues,
  mailingReplaceSchema,
  type MailingReplaceFormValues,
} from '@/features/mailings/schemas/mailing.schema'
import { useCreateMessages } from '@/features/messages/hooks/useCreateMessages'
import {
  isConflictError,
  isValidationError,
  localizeConflictDetail,
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

interface CreateMessageDialogProps {
  mailingId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (count: number) => void
}

export function CreateMessageDialog({
  mailingId,
  open,
  onOpenChange,
  onSuccess,
}: CreateMessageDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createMessages = useCreateMessages(mailingId)

  const form = useForm<MailingReplaceFormValues>({
    resolver: zodResolver(mailingReplaceSchema),
    defaultValues: defaultMailingReplaceFormValues,
  })

  const { handleSubmit, reset, setError } = form

  useEffect(() => {
    if (open) {
      reset(defaultMailingReplaceFormValues)
      setSubmitError(null)
    }
  }, [open, reset])

  async function onSubmit(values: MailingReplaceFormValues) {
    setSubmitError(null)

    const payload = buildMailingMessagesPayload(values)

    try {
      const created = await createMessages.mutateAsync(payload)
      onOpenChange(false)
      onSuccess?.(created.length)
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
        error instanceof Error ? error.message : 'Не удалось добавить сообщения',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Новые сообщения</DialogTitle>
          <DialogDescription>
            Добавьте одно или несколько SMS в рассылку
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <MessagesEditor />

              {submitError && (
                <ActionAlert
                  action="error"
                  entity="message"
                  message={submitError}
                  className="mt-4"
                />
              )}
            </div>

            <DialogFooter className="mt-0 shrink-0">
              <Button
                type="button"
                variant="outline"
                disabled={createMessages.isPending}
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={createMessages.isPending}>
                {createMessages.isPending && (
                  <Loader2Icon className="animate-spin" />
                )}
                Добавить
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
