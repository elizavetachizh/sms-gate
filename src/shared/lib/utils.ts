import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Собирает CSS-классы в одну строку и разрешает конфликты Tailwind.
 *
 * 1. `clsx` — склеивает аргументы (строки, объекты, массивы), отбрасывает falsy.
 * 2. `twMerge` — при дубликатах утилит оставляет последний (напр. `p-2` + `p-4` → `p-4`).
 *
 * @example cn('px-2', isActive && 'bg-accent', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Форматирует ISO-дату/время для UI (ru-RU). */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

/** Короткий префикс UUID для отображения в таблицах. */
export function shortId(id: string): string {
  return id.slice(0, 8)
}
