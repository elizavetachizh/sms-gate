import { isConflictError, isForbiddenError, localizeConflictDetail } from '@/shared/api'

export function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (isForbiddenError(error)) {
    return 'Недостаточно прав для этого действия'
  }

  if (isConflictError(error)) {
    return localizeConflictDetail(error.detail)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
