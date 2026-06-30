import type { MessageStatus } from '@/shared/api'

const TERMINAL_STATUSES = new Set<MessageStatus>([
  'delivered',
  'undelivered',
  'failed',
  'unknown',
])

export function isTerminalMessageStatus(status: MessageStatus): boolean {
  return TERMINAL_STATUSES.has(status)
}

export function hasPendingMessages(
  messages: { status: MessageStatus }[],
): boolean {
  return messages.some((message) => !isTerminalMessageStatus(message.status))
}
