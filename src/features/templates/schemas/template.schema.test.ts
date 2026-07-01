import { describe, expect, it } from 'vitest'
import {
  SMS_TEXT_MAX_LENGTH,
  templateFormSchema,
} from './template.schema'

describe('templateFormSchema', () => {
  it('accepts valid template', () => {
    const result = templateFormSchema.safeParse({
      name: 'Приветствие',
      text: 'Здравствуйте!',
    })

    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = templateFormSchema.safeParse({
      name: '   ',
      text: 'Текст',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['name'])
    }
  })

  it('rejects name longer than 255 characters', () => {
    const result = templateFormSchema.safeParse({
      name: 'a'.repeat(256),
      text: 'Текст',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['name'])
    }
  })

  it('rejects empty text', () => {
    const result = templateFormSchema.safeParse({
      name: 'Шаблон',
      text: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['text'])
    }
  })

  it('rejects text longer than SMS_TEXT_MAX_LENGTH', () => {
    const result = templateFormSchema.safeParse({
      name: 'Шаблон',
      text: 'a'.repeat(SMS_TEXT_MAX_LENGTH + 1),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['text'])
    }
  })
})
