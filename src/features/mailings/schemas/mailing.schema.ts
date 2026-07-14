import { z } from "zod";
import { belarusPhoneSchema } from "@/shared/lib/belarus-phone";
import { addSmsTextIssues, SMS_TEXT_MAX_LENGTH } from "@/shared/lib/sms-text";

const msisdnSchema = belarusPhoneSchema;

/** @deprecated Use SMS_TEXT_MAX_LENGTH from @/shared/lib/sms-text */
export const SMS_SEGMENT_LENGTH = SMS_TEXT_MAX_LENGTH;

export const mailingTextModes = ["same", "different"] as const;
export type MailingTextMode = (typeof mailingTextModes)[number];

export const messageCreateSchema = z.object({
  msisdn: msisdnSchema,
  text: z.string(),
});

const mailingMessagesFormBaseSchema = z.object({
  text_mode: z.enum(mailingTextModes),
  shared_text: z.string(),
  messages: z
    .array(messageCreateSchema)
    .min(1, "Добавьте хотя бы одного получателя"),
});

function refineMailingMessagesForm<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const { text_mode, shared_text, messages } = data as z.infer<
      typeof mailingMessagesFormBaseSchema
    >;

    if (text_mode === "same") {
      addSmsTextIssues(shared_text, ctx, ["shared_text"]);
      return;
    }

    messages.forEach((message, index) => {
      addSmsTextIssues(message.text, ctx, ["messages", index, "text"]);
    });
  });
}

export const mailingReplaceSchema = refineMailingMessagesForm(
  mailingMessagesFormBaseSchema,
);

export const mailingCreateSchema = refineMailingMessagesForm(
  mailingMessagesFormBaseSchema.extend({
    provider_code: z.string().min(1, "Выберите провайдера"),
  }),
);

export type MailingCreateFormValues = z.infer<typeof mailingCreateSchema>;
export type MailingReplaceFormValues = z.infer<typeof mailingReplaceSchema>;
export type MessageCreateFormValues = z.infer<typeof messageCreateSchema>;

export const defaultMessageValues: MessageCreateFormValues = {
  msisdn: "",
  text: "",
};

export const defaultMailingReplaceFormValues: MailingReplaceFormValues = {
  text_mode: "same",
  shared_text: "",
  messages: [defaultMessageValues],
};

export const defaultMailingFormValues: MailingCreateFormValues = {
  provider_code: "",
  text_mode: "same",
  shared_text: "",
  messages: [defaultMessageValues],
};
