import type { FieldPath, UseFormSetError } from "react-hook-form";
import type { ValidationDetail } from "@/shared/api";

export function mapValidationErrors(
  details: ValidationDetail[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const detail of details) {
    const path = detail.loc
      .filter((part) => part !== "body")
      .map(String)
      .join(".");

    if (path) {
      errors[path] = detail.msg;
    }
  }

  return errors;
}

export function applyValidationErrors<T extends Record<string, unknown>>(
  errors: Record<string, string>,
  setError: UseFormSetError<T>,
): void {
  for (const [path, message] of Object.entries(errors)) {
    setError(path as FieldPath<T>, { message });
  }
}
