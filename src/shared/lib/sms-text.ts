import type z from "zod";

export const SMS_TEXT_MAX_LENGTH = 1600;

export function addSmsTextIssues(
  text: string,
  ctx: Pick<z.RefinementCtx, "addIssue">,
  path: (string | number)[],
) {
  const trimmed = text.trim();
  if (!trimmed) {
    ctx.addIssue({
      code: "custom",
      message: "Введите текст SMS",
      path,
    });
  } else if (trimmed.length > SMS_TEXT_MAX_LENGTH) {
    ctx.addIssue({
      code: "custom",
      message: `Не более ${SMS_TEXT_MAX_LENGTH} символов`,
      path,
    });
  }
}
