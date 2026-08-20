import { afterEach, describe, expect, it } from 'vitest'
import { clearCredentials, getCredentials, setCredentials } from './config'

afterEach(() => {
  sessionStorage.clear()
})

describe('credentials storage', () => {
  it('round-trips email and password in sessionStorage', () => {
    setCredentials({ email: 'user@example.com', password: 'password123' })

    expect(getCredentials()).toEqual({
      email: 'user@example.com',
      password: 'password123',
    })
  })

  it('returns null when credentials were never set', () => {
    expect(getCredentials()).toBeNull()
  })

  it('clears stored credentials', () => {
    setCredentials({ email: 'user@example.com', password: 'password123' })
    clearCredentials()

    expect(getCredentials()).toBeNull()
  })

  it('returns null for malformed stored JSON', () => {
    sessionStorage.setItem('sms-gate-credentials', '{not-json')

    expect(getCredentials()).toBeNull()
    expect(sessionStorage.getItem('sms-gate-credentials')).toBeNull()
  })

  it('returns null and clears storage for an object without email/password', () => {
    sessionStorage.setItem('sms-gate-credentials', JSON.stringify({ foo: 1 }))

    expect(getCredentials()).toBeNull()
    expect(sessionStorage.getItem('sms-gate-credentials')).toBeNull()
  })

  it('returns null and clears storage when fields have the wrong type', () => {
    sessionStorage.setItem(
      'sms-gate-credentials',
      JSON.stringify({ email: 1, password: true }),
    )

    expect(getCredentials()).toBeNull()
    expect(sessionStorage.getItem('sms-gate-credentials')).toBeNull()
  })

  it('returns null and clears storage for empty email or password', () => {
    sessionStorage.setItem(
      'sms-gate-credentials',
      JSON.stringify({ email: '', password: 'password123' }),
    )

    expect(getCredentials()).toBeNull()
    expect(sessionStorage.getItem('sms-gate-credentials')).toBeNull()
  })

  it('keeps only email and password when extra keys are stored', () => {
    sessionStorage.setItem(
      'sms-gate-credentials',
      JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
        extra: true,
      }),
    )

    expect(getCredentials()).toEqual({
      email: 'user@example.com',
      password: 'password123',
    })
  })
})
