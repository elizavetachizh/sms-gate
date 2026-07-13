import type { MailingCreateMessage } from '@/shared/api'
import type { MailingCreateFormValues } from '../schemas/mailing.schema'

export function buildMailingMessagesPayload(
  values: Pick<MailingCreateFormValues, 'text_mode' | 'shared_text' | 'messages'>,
): MailingCreateMessage[] {
  if (values.text_mode === 'same') {
    const text = values.shared_text.trim()

    return values.messages.map((message) => ({
      msisdn: message.msisdn,
      text,
    }))
  }

  return values.messages.map((message) => ({
    msisdn: message.msisdn,
    text: message.text.trim(),
  }))
}
