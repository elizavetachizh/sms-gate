import { describe, expect, it } from 'vitest'
import {
  mailingCreateSchema,
  SMS_SEGMENT_LENGTH,
} from './mailing.schema'

describe('mailingCreateSchema', () => {
  it('accepts same-text mailing with valid msisdn', () => {
    const result = mailingCreateSchema.safeParse({
      provider_code: 'fake',
      text_mode: 'same',
      shared_text: 'Привет!',
      messages: [{ msisdn: '375291234567', text: '' }],
    })

    expect(result.success).toBe(true)
  })

  it('accepts different-text mailing when each message has text', () => {
    const result = mailingCreateSchema.safeParse({
      provider_code: 'fake',
      text_mode: 'different',
      shared_text: '',
      messages: [
        { msisdn: '375291234567', text: 'Текст 1' },
        { msisdn: '375441234567', text: 'Текст 2' },
      ],
    })

    expect(result.success).toBe(true)
  })

  it('rejects empty provider_code', () => {
    const result = mailingCreateSchema.safeParse({
      provider_code: '',
      text_mode: 'same',
      shared_text: 'Hi',
      messages: [{ msisdn: '375291234567', text: '' }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['provider_code'])
    }
  })

  it('rejects invalid msisdn', () => {
    const result = mailingCreateSchema.safeParse({
      provider_code: 'fake',
      text_mode: 'same',
      shared_text: 'Hi',
      messages: [{ msisdn: 'abc', text: '' }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('msisdn'))).toBe(
        true,
      )
    }
  })

  it('rejects empty shared_text in same mode', () => {
    const result = mailingCreateSchema.safeParse({
      provider_code: 'fake',
      text_mode: 'same',
      shared_text: '   ',
      messages: [{ msisdn: '375291234567', text: '' }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('shared_text'))).toBe(
        true,
      )
    }
  })

  it('rejects shared_text longer than SMS_SEGMENT_LENGTH in same mode', () => {
    const result = mailingCreateSchema.safeParse({
      provider_code: 'fake',
      text_mode: 'same',
      shared_text: 'a'.repeat(SMS_SEGMENT_LENGTH + 1),
      messages: [{ msisdn: '375291234567', text: '' }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('shared_text'))).toBe(
        true,
      )
    }
  })

  it('rejects empty message text in different mode', () => {
    const result = mailingCreateSchema.safeParse({
      provider_code: 'fake',
      text_mode: 'different',
      shared_text: '',
      messages: [{ msisdn: '375291234567', text: '   ' }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) =>
            issue.path[0] === 'messages' &&
            issue.path[1] === 0 &&
            issue.path[2] === 'text',
        ),
      ).toBe(true)
    }
  })

  it('rejects mailing without recipients', () => {
    const result = mailingCreateSchema.safeParse({
      provider_code: 'fake',
      text_mode: 'same',
      shared_text: 'Hi',
      messages: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('messages'))).toBe(
        true,
      )
    }
  })
})
