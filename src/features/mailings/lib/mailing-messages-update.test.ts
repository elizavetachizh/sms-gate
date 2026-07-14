import { describe, expect, it } from 'vitest'
import { parseBulkDeleteMsisdns } from '@/features/mailings/lib/parse-bulk-delete-msisdns'
import {
  countDeletableMessages,
  filterMessagesExcludingIds,
  filterMessagesForBulkDelete,
} from '@/features/mailings/lib/mailing-messages-update'
import type { MessageRead } from '@/shared/api'

function createMessage(
  msisdn: string,
  status: MessageRead['status'] = 'created',
): MessageRead {
  return {
    id: msisdn,
    msisdn,
    text: 'Hello',
    send_on: null,
    external_id: null,
    status,
    batch_id: null,
  }
}

describe('parseBulkDeleteMsisdns', () => {
  it('parses numbers separated by newlines and commas', () => {
    expect(
      parseBulkDeleteMsisdns('375291234567\n375 (33) 123-45-67,375441234567'),
    ).toEqual(new Set(['375291234567', '375331234567', '375441234567']))
  })
})

describe('filterMessagesExcludingIds', () => {
  it('removes only created messages with matching ids', () => {
    const messages = [
      createMessage('375291234567'),
      createMessage('375331234567'),
      createMessage('375441234567', 'queued'),
    ]

    const remaining = filterMessagesExcludingIds(
      messages,
      new Set(['375291234567', '375441234567']),
    )

    expect(remaining.map((message) => message.msisdn)).toEqual([
      '375331234567',
      '375441234567',
    ])
  })
})

describe('filterMessagesForBulkDelete', () => {
  it('removes only created messages with matching msisdn', () => {
    const messages = [
      createMessage('375291234567'),
      createMessage('375331234567'),
      createMessage('375441234567', 'queued'),
    ]

    const remaining = filterMessagesForBulkDelete(
      messages,
      new Set(['375291234567', '375441234567']),
    )

    expect(remaining.map((message) => message.msisdn)).toEqual([
      '375331234567',
      '375441234567',
    ])
  })
})

describe('countDeletableMessages', () => {
  it('counts only created messages matched by msisdn', () => {
    const messages = [
      createMessage('375291234567'),
      createMessage('375331234567'),
      createMessage('375441234567', 'queued'),
    ]

    expect(
      countDeletableMessages(messages, new Set(['375291234567', '375441234567'])),
    ).toBe(1)
  })
})
