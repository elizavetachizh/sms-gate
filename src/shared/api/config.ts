const API_KEY_STORAGE_KEY = 'sms-gate-api-key'

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
}

export function getApiKey(): string | null {
  const fromStorage = sessionStorage.getItem(API_KEY_STORAGE_KEY)
  if (fromStorage) {
    return fromStorage
  }

  const fromEnv = import.meta.env.VITE_API_KEY
  return fromEnv || null
}

export function setApiKey(key: string): void {
  sessionStorage.setItem(API_KEY_STORAGE_KEY, key)
}

export function clearApiKey(): void {
  sessionStorage.removeItem(API_KEY_STORAGE_KEY)
}
