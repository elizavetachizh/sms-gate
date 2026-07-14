import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { MailingTextField } from "@/features/mailings/components/messages-editor/MailingTextField";
import {
  createMessageFormSchema,
  type CreateMessageFormValues,
} from "@/features/messages/schemas/message.schema";
import {
  isValidationError,
  useUpdateMessage,
} from "@/features/messages/hooks/useUpdateMessage";
import {
  isConflictError,
  localizeConflictDetail,
  type MessageRead,
} from "@/shared/api";
import {
  applyValidationErrors,
  mapValidationErrors,
} from "@/shared/api/map-validation-errors";
import { ActionAlert } from "@/shared/ui/action-alert";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { PhoneInput } from "@/shared/ui/phone-input";

interface EditMessageDialogProps {
  mailingId: string;
  message: MessageRead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function getEditFormValues(message: MessageRead): CreateMessageFormValues {
  return {
    msisdn: message.msisdn,
    text: message.text,
  };
}

interface EditMessageDialogFormProps {
  mailingId: string;
  message: MessageRead;
  onClose: () => void;
  onSuccess?: () => void;
}

function EditMessageDialogForm({
  mailingId,
  message,
  onClose,
  onSuccess,
}: EditMessageDialogFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const updateMessage = useUpdateMessage(mailingId);

  const form = useForm<CreateMessageFormValues>({
    resolver: zodResolver(createMessageFormSchema),
    defaultValues: getEditFormValues(message),
  });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = form;

  async function onSubmit(values: CreateMessageFormValues) {
    setSubmitError(null);

    try {
      await updateMessage.mutateAsync({
        messageId: message.id,
        body: {
          msisdn: values.msisdn,
          text: values.text.trim(),
        },
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      if (isValidationError(error)) {
        if (error.detailMessage) {
          setSubmitError(error.detailMessage);
          return;
        }
        applyValidationErrors(mapValidationErrors(error.details), setError);
        return;
      }

      if (isConflictError(error)) {
        setSubmitError(localizeConflictDetail(error.detail));
        return;
      }

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить сообщение",
      );
    }
  }

  return (
    <FormProvider {...form}>
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

        <MailingTextField<CreateMessageFormValues>
          name="text"
          id="edit-message-text"
          templatePickerId="edit-message-template"
          pickerClassName="sm:w-48"
          rows={4}
        />

        {submitError && (
          <ActionAlert action="error" entity="message" message={submitError} />
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={updateMessage.isPending}
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={updateMessage.isPending}>
            {updateMessage.isPending && (
              <Loader2Icon className="animate-spin" />
            )}
            Сохранить
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}

export function EditMessageDialog({
  mailingId,
  message,
  open,
  onOpenChange,
  onSuccess,
}: EditMessageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактирование сообщения</DialogTitle>
          <DialogDescription>
            Измените номер получателя или текст SMS
          </DialogDescription>
        </DialogHeader>

        {message && (
          <EditMessageDialogForm
            key={message.id}
            mailingId={mailingId}
            message={message}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
