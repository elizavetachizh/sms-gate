export const servicesKeys = {
  all: ['services'] as const,
  analyzeText: (text: string) =>
    [...servicesKeys.all, 'analyze-text', text] as const,
}
