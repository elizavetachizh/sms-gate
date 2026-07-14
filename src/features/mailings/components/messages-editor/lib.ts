import type { FieldErrors } from 'react-hook-form'
import type {
  MailingReplaceFormValues,
  MailingTextMode,
} from '@/features/mailings/schemas/mailing.schema'

export function getMessagesArrayError(
  errors: FieldErrors<MailingReplaceFormValues>['messages'],
): string | undefined {
  return (
    errors?.root?.message ??
    (typeof errors?.message === 'string' ? errors.message : undefined)
  )
}

export function buildTextModeValues(
  nextMode: MailingTextMode,
  messages: MailingReplaceFormValues['messages'],
  sharedText: string,
): Pick<MailingReplaceFormValues, 'messages' | 'shared_text'> {
  if (nextMode === 'same') {
    const text =
      sharedText.trim() ||
      messages.find((message) => message.text.trim())?.text ||
      ''

    return {
      shared_text: text,
      messages: messages.map((message) => ({ msisdn: message.msisdn, text: '' })),
    }
  }

  const text = sharedText.trim()

  return {
    shared_text: sharedText,
    messages: messages.map((message) => ({
      msisdn: message.msisdn,
      text: text || message.text,
    })),
  }
}
