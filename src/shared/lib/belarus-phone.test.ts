import { describe, expect, it } from 'vitest'
import {
  BELARUS_PHONE_DIGITS_LENGTH,
  extractBelarusPhoneDigits,
  formatBelarusPhone,
  isValidBelarusPhone,
  normalizeBelarusPhoneDigits,
} from './belarus-phone'

describe('belarus-phone', () => {
  it('formats full number as 375 (XX) XXX-XX-XX', () => {
    expect(formatBelarusPhone('375291234567')).toBe('375 (29) 123-45-67')
  })

  it('formats partial input progressively', () => {
    expect(formatBelarusPhone('375')).toBe('375 (')
    expect(formatBelarusPhone('37529')).toBe('375 (29')
    expect(formatBelarusPhone('375291')).toBe('375 (29) 1')
    expect(formatBelarusPhone('37529123')).toBe('375 (29) 123')
    expect(formatBelarusPhone('3752912345')).toBe('375 (29) 123-45')
  })

  it('normalizes numbers without country code', () => {
    expect(normalizeBelarusPhoneDigits('291234567')).toBe('375291234567')
  })

  it('extracts digits from formatted value', () => {
    expect(extractBelarusPhoneDigits('375 (29) 123-45-67')).toBe('375291234567')
  })

  it('validates complete belarus phone', () => {
    expect(isValidBelarusPhone('375291234567')).toBe(true)
    expect(isValidBelarusPhone('375 (29) 123-45-67')).toBe(true)
    expect(isValidBelarusPhone('37529')).toBe(false)
    expect(isValidBelarusPhone('abc')).toBe(false)
  })

  it('limits digits to 12 characters', () => {
    expect(normalizeBelarusPhoneDigits('375291234567890')).toHaveLength(
      BELARUS_PHONE_DIGITS_LENGTH,
    )
  })
})
