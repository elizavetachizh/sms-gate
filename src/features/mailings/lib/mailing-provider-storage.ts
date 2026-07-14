// TODO: remove once MailingRead includes provider_code from the API.
const KEY_PREFIX = 'mailing-provider:'

export function getStoredMailingProviderCode(mailingId: string): string | null {
  try {
    return sessionStorage.getItem(`${KEY_PREFIX}${mailingId}`)
  } catch {
    return null
  }
}

export function setStoredMailingProviderCode(
  mailingId: string,
  providerCode: string,
): void {
  try {
    sessionStorage.setItem(`${KEY_PREFIX}${mailingId}`, providerCode)
  } catch {
    // sessionStorage may be unavailable
  }
}
