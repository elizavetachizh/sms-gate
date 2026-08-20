/** Empty / null → null (backend uses current UTC). Otherwise ISO 8601 with timezone. */
export function toMailingSendOnIso(value?: string | null): string | null {
  if (value == null || value.trim() === "") {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

/** ISO → value for `datetime-local` in the browser timezone. */
export function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
