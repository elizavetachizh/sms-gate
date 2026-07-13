import type { MessageRead } from '@/shared/api'
import {
  defaultMessageValues,
  type MailingReplaceFormValues,
} from '../schemas/mailing.schema'

export function messagesToReplaceFormValues(
  messages: MessageRead[],
): MailingReplaceFormValues {
  if (messages.length === 0) {
    return {
      text_mode: 'same',
      shared_text: '',
      messages: [defaultMessageValues],
    }
  }

  const uniqueTexts = new Set(messages.map((message) => message.text))

  if (uniqueTexts.size === 1) {
    return {
      text_mode: 'same',
      shared_text: messages[0].text,
      messages: messages.map((message) => ({
        msisdn: message.msisdn,
        text: '',
      })),
    }
  }

  return {
    text_mode: 'different',
    shared_text: '',
    messages: messages.map((message) => ({
      msisdn: message.msisdn,
      text: message.text,
    })),
  }
}
