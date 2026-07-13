import { isConflictError, localizeConflictDetail } from '@/shared/api'

export function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (isConflictError(error)) {
    return localizeConflictDetail(error.detail)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
