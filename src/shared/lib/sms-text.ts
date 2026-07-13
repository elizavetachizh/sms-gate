import { SMS_SEGMENT_LENGTH } from "@/features/mailings/schemas/mailing.schema";
import type z from "zod";

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
  } else if (trimmed.length > SMS_SEGMENT_LENGTH) {
    ctx.addIssue({
      code: "custom",
      message: `Не более ${SMS_SEGMENT_LENGTH} символов`,
      path,
    });
  }
}
