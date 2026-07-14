import type { SmsTextAnalyzeResponse } from "@/shared/api";

export interface SmsAnalysisWarning {
  id: string;
  message: string;
}

export function formatSmsAnalysisSummary(data: SmsTextAnalyzeResponse): string {
  return `${data.characters} / ${data.capacity}`;
}

export function getSmsAnalysisWarnings(
  data: SmsTextAnalyzeResponse,
): SmsAnalysisWarning[] {
  const warnings: SmsAnalysisWarning[] = [];

  if (data.is_concatenated) {
    warnings.push({
      id: "concatenated",
      message: `Текст будет отправлен в ${data.segments} SMS (склеенное сообщение).`,
    });
  }

  return warnings;
}
