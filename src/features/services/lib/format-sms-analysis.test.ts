import { describe, expect, it } from 'vitest'
import {
  formatSmsAnalysisSummary,
  getSmsAnalysisWarnings,
} from '@/features/services/lib/format-sms-analysis'
import type { SmsTextAnalyzeResponse } from '@/shared/api'

function createAnalysis(
  overrides: Partial<SmsTextAnalyzeResponse> = {},
): SmsTextAnalyzeResponse {
  return {
    encoding: 'gsm7',
    characters: 10,
    units: 10,
    segments: 1,
    capacity: 160,
    remaining: 150,
    per_segment_limit: 160,
    is_concatenated: false,
    non_gsm_characters: [],
    ...overrides,
  }
}

describe('formatSmsAnalysisSummary', () => {
  it('formats segments, characters and capacity', () => {
    const data = createAnalysis({
      characters: 346,
      segments: 3,
      capacity: 459,
    })

    expect(formatSmsAnalysisSummary(data)).toBe(
      'Сообщений: 3 · Символов: 346 · Лимит: 459',
    )
  })
})

describe('getSmsAnalysisWarnings', () => {
  it('returns concatenated warning', () => {
    const warnings = getSmsAnalysisWarnings(
      createAnalysis({ segments: 3, is_concatenated: true }),
    )

    expect(warnings).toContainEqual({
      id: 'concatenated',
      message: 'Текст будет отправлен в 3 SMS (склеенное сообщение).',
    })
  })

  it('returns ucs2 warning', () => {
    const warnings = getSmsAnalysisWarnings(
      createAnalysis({ encoding: 'ucs2', per_segment_limit: 67 }),
    )

    expect(warnings).toContainEqual({
      id: 'ucs2',
      message:
        'Используется UCS-2: до 67 символов на сегмент вместо 160/153 в GSM-7.',
    })
  })

  it('returns non-gsm warning with preview', () => {
    const warnings = getSmsAnalysisWarnings(
      createAnalysis({ non_gsm_characters: ['—', 'а', 'б'] }),
    )

    expect(warnings).toContainEqual({
      id: 'non-gsm',
      message: 'Из-за символов вне GSM-7 лимит снижен: «—», «а», «б».',
    })
  })

  it('truncates long non-gsm character list', () => {
    const warnings = getSmsAnalysisWarnings(
      createAnalysis({
        non_gsm_characters: ['—', 'а', 'б', 'в', 'г', 'д', 'е'],
      }),
    )

    expect(warnings[0]?.message).toContain('и ещё 2')
  })
})
