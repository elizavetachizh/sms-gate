import { describe, expect, it } from 'vitest'
import { buildTextModeValues } from '@/features/mailings/components/messages-editor/lib'

describe('buildTextModeValues', () => {
  it('moves first message text to shared_text in same mode', () => {
    expect(
      buildTextModeValues(
        'same',
        [
          { msisdn: '375291234567', text: 'Hello' },
          { msisdn: '375291234568', text: 'Other' },
        ],
        '',
      ),
    ).toEqual({
      shared_text: 'Hello',
      messages: [
        { msisdn: '375291234567', text: '' },
        { msisdn: '375291234568', text: '' },
      ],
    })
  })

  it('copies shared_text to each message in different mode', () => {
    expect(
      buildTextModeValues(
        'different',
        [
          { msisdn: '375291234567', text: '' },
          { msisdn: '375291234568', text: 'Personal' },
        ],
        'Broadcast',
      ),
    ).toEqual({
      shared_text: 'Broadcast',
      messages: [
        { msisdn: '375291234567', text: 'Broadcast' },
        { msisdn: '375291234568', text: 'Broadcast' },
      ],
    })
  })
})
