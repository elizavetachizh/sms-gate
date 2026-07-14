import { normalizeBelarusPhoneDigits } from '@/shared/lib/belarus-phone'

export function parseBulkDeleteMsisdns(input: string): Set<string> {
  const msisdns = new Set<string>()

  for (const part of input.split(/[\n,;]+/)) {
    const digits = normalizeBelarusPhoneDigits(part.trim())
    if (digits.length === 12) {
      msisdns.add(digits)
    }
  }

  return msisdns
}
