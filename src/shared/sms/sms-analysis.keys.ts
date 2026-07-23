export const smsAnalysisKeys = {
  all: ["sms-analysis"] as const,
  analyzeText: (text: string) =>
    [...smsAnalysisKeys.all, "analyze-text", text] as const,
};
