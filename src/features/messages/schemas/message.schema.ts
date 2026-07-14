import { z } from "zod";
import {
  messageCreateSchema,
} from "@/features/mailings/schemas/mailing.schema";
import { addSmsTextIssues } from "@/shared/lib/sms-text";

export const createMessageFormSchema = messageCreateSchema.superRefine(
  (data, ctx) => {
    addSmsTextIssues(data.text, ctx, ["text"]);
  },
);

export type CreateMessageFormValues = z.infer<typeof createMessageFormSchema>;

