import { z } from "zod";

export const BELARUS_PHONE_FORMAT = "375 (XX) XXX-XX-XX";
export const BELARUS_PHONE_PLACEHOLDER = "375 (29) 123-45-67";
export const BELARUS_PHONE_DIGITS_LENGTH = 12;
const BELARUS_PHONE_COUNTRY_CODE = "375";

/** Извлекает только цифры, не более 12 символов. */
export function extractBelarusPhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, BELARUS_PHONE_DIGITS_LENGTH);
}

/** Нормализует ввод: всегда начинается с 375, максимум 12 цифр. */
export function normalizeBelarusPhoneDigits(value: string): string {
  let digits = extractBelarusPhoneDigits(value);

  if (digits.length === 0) {
    return "";
  }

  if (!digits.startsWith(BELARUS_PHONE_COUNTRY_CODE)) {
    digits = `${BELARUS_PHONE_COUNTRY_CODE}${digits}`;
  }

  return digits.slice(0, BELARUS_PHONE_DIGITS_LENGTH);
}

/** Форматирует цифры в вид `375 (XX) XXX-XX-XX`. */
export function formatBelarusPhone(value: string): string {
  const digits = normalizeBelarusPhoneDigits(value);

  if (digits.length === 0) {
    return "";
  }

  const tail = digits.slice(BELARUS_PHONE_COUNTRY_CODE.length);
  let formatted = `${BELARUS_PHONE_COUNTRY_CODE} (${tail.slice(0, 2)}`;

  if (tail.length <= 2) {
    return formatted;
  }

  formatted += `) ${tail.slice(2, 5)}`;

  if (tail.length <= 5) {
    return formatted;
  }

  formatted += `-${tail.slice(5, 7)}`;

  if (tail.length <= 7) {
    return formatted;
  }

  return `${formatted}-${tail.slice(7, 9)}`;
}

/** Проверяет полный номер: 12 цифр, код страны 375. */
export function isValidBelarusPhone(value: string): boolean {
  const digits = extractBelarusPhoneDigits(value);
  return (
    digits.length === BELARUS_PHONE_DIGITS_LENGTH &&
    digits.startsWith(BELARUS_PHONE_COUNTRY_CODE)
  );
}

export const belarusPhoneSchema = z
  .string()
  .trim()
  .min(1, "Введите номер телефона")
  .refine(isValidBelarusPhone, `Формат: ${BELARUS_PHONE_FORMAT}`);

export const belarusPhoneOptionalSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || isValidBelarusPhone(value),
    `Формат: ${BELARUS_PHONE_FORMAT}`,
  );
