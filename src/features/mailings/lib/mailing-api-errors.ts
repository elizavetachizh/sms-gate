import type { UseFormSetError } from 'react-hook-form'
import type { ValidationError } from '@/shared/api'
import {
  applyValidationErrors,
  mapValidationErrors,
} from '@/shared/api/map-validation-errors'
import type { MailingCreateFormValues } from '../schemas/mailing.schema'

const MAILING_API_DETAIL_MESSAGES: Record<string, string> = {
  'Unknown provider': 'Провайдер не найден',
  'Provider disabled': 'Провайдер выключен',
  'Provider is not configured on this server': 'Провайдер не настроен на сервере',
}

export function localizeMailingApiDetail(detail: string): string {
  return MAILING_API_DETAIL_MESSAGES[detail] ?? detail
}

export function applyCreateMailingValidationErrors(
  error: ValidationError,
  setError: UseFormSetError<MailingCreateFormValues>,
): void {
  if (error.detailMessage) {
    setError('provider_code', {
      message: localizeMailingApiDetail(error.detailMessage),
    })
    return
  }

  applyValidationErrors(mapValidationErrors(error.details), setError)
}
