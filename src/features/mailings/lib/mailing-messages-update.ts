import type { MailingCreateMessage, MessageRead } from "@/shared/api";

export function messagesToUpdatePayload(
  messages: MessageRead[],
): MailingCreateMessage[] {
  return messages.map((message) => ({
    msisdn: message.msisdn,
    text: message.text,
  }));
}

export function filterMessagesExcludingIds(
  messages: MessageRead[],
  idsToDelete: Set<string>,
): MessageRead[] {
  if (idsToDelete.size === 0) {
    return messages;
  }

  return messages.filter(
    (message) => message.status !== "created" || !idsToDelete.has(message.id),
  );
}
