import { describe, expect, it } from "vitest";
import {
  formatSmsAnalysisSummary,
  getSmsAnalysisWarnings,
} from "@/shared/sms/format-sms-analysis";
import type { SmsTextAnalyzeResponse } from "@/shared/api";

function createAnalysis(
  overrides: Partial<SmsTextAnalyzeResponse> = {},
): SmsTextAnalyzeResponse {
  return {
    encoding: "gsm7",
    characters: 10,
    units: 10,
    segments: 1,
    capacity: 160,
    remaining: 150,
    per_segment_limit: 160,
    is_concatenated: false,
    non_gsm_characters: [],
    ...overrides,
  };
}

describe("formatSmsAnalysisSummary", () => {
  it("formats characters and capacity", () => {
    const data = createAnalysis({ characters: 346, capacity: 459 });

    expect(formatSmsAnalysisSummary(data)).toBe("346 / 459");
  });
});

describe("getSmsAnalysisWarnings", () => {
  it("returns concatenated warning", () => {
    const warnings = getSmsAnalysisWarnings(
      createAnalysis({ segments: 3, is_concatenated: true }),
    );

    expect(warnings).toEqual([
      {
        id: "concatenated",
        message: "Текст будет отправлен в 3 SMS (склеенное сообщение).",
      },
    ]);
  });

  it("returns empty list when message is single-segment", () => {
    const warnings = getSmsAnalysisWarnings(createAnalysis());

    expect(warnings).toEqual([]);
  });
});
