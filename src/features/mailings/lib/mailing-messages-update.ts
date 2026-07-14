import type { MailingCreateMessage, MessageRead } from '@/shared/api'
import { normalizeBelarusPhoneDigits } from '@/shared/lib/belarus-phone'

export function messagesToUpdatePayload(
  messages: MessageRead[],
): MailingCreateMessage[] {
  return messages.map((message) => ({
    msisdn: message.msisdn,
    text: message.text,
  }))
}

export function filterMessagesExcludingIds(
  messages: MessageRead[],
  idsToDelete: Set<string>,
): MessageRead[] {
  if (idsToDelete.size === 0) {
    return messages
  }

  return messages.filter(
    (message) =>
      message.status !== 'created' || !idsToDelete.has(message.id),
  )
}

export function filterMessagesForBulkDelete(
  messages: MessageRead[],
  msisdnsToDelete: Set<string>,
): MessageRead[] {
  if (msisdnsToDelete.size === 0) {
    return messages
  }

  return messages.filter((message) => {
    if (message.status !== 'created') {
      return true
    }

    return !msisdnsToDelete.has(normalizeBelarusPhoneDigits(message.msisdn))
  })
}

export function countDeletableMessages(
  messages: MessageRead[],
  msisdnsToDelete: Set<string>,
): number {
  return messages.filter(
    (message) =>
      message.status === 'created' &&
      msisdnsToDelete.has(normalizeBelarusPhoneDigits(message.msisdn)),
  ).length
}
