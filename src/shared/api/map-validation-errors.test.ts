import { describe, expect, it, vi } from 'vitest'
import type { ValidationDetail } from '@/shared/api'
import {
  applyValidationErrors,
  mapValidationErrors,
} from './map-validation-errors'

describe('mapValidationErrors', () => {
  it('maps FastAPI loc to react-hook-form field paths', () => {
    const details: ValidationDetail[] = [
      {
        type: 'value_error',
        loc: ['body', 'messages', 0, 'msisdn'],
        msg: 'Msisdn must contain only digits and optional leading plus',
      },
      {
        type: 'value_error',
        loc: ['body', 'provider_code'],
        msg: 'Field required',
      },
    ]

    expect(mapValidationErrors(details)).toEqual({
      'messages.0.msisdn':
        'Msisdn must contain only digits and optional leading plus',
      provider_code: 'Field required',
    })
  })

  it('skips body prefix and ignores empty paths', () => {
    const details: ValidationDetail[] = [
      {
        type: 'value_error',
        loc: ['body'],
        msg: 'Invalid payload',
      },
    ]

    expect(mapValidationErrors(details)).toEqual({})
  })
})

describe('applyValidationErrors', () => {
  it('calls setError for each mapped field', () => {
    const setError = vi.fn()

    applyValidationErrors(
      {
        'messages.0.text': 'Введите текст SMS',
        provider_code: 'Выберите провайдера',
      },
      setError,
    )

    expect(setError).toHaveBeenCalledTimes(2)
    expect(setError).toHaveBeenCalledWith('messages.0.text', {
      message: 'Введите текст SMS',
    })
    expect(setError).toHaveBeenCalledWith('provider_code', {
      message: 'Выберите провайдера',
    })
  })
})
