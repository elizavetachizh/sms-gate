import { z } from 'zod'

const msisdnSchema = z
  .string()
  .trim()
  .min(9, 'Номер: от 9 до 16 символов')
  .max(16, 'Номер: от 9 до 16 символов')
  .refine(
    (value) => /^\+?[\d\s-]+$/.test(value) && value.replace(/\D/g, '').length >= 9,
    'Только цифры, пробелы и +',
  )

export const SMS_SEGMENT_LENGTH = 1600

export const mailingTextModes = ['same', 'different'] as const
export type MailingTextMode = (typeof mailingTextModes)[number]

export const messageCreateSchema = z.object({
  msisdn: msisdnSchema,
  text: z.string(),
})

export const mailingCreateSchema = z
  .object({
    provider_code: z.string().min(1, 'Выберите провайдера'),
    text_mode: z.enum(mailingTextModes),
    shared_text: z.string(),
    messages: z
      .array(messageCreateSchema)
      .min(1, 'Добавьте хотя бы одного получателя'),
  })
  .superRefine((data, ctx) => {
    if (data.text_mode === 'same') {
      const text = data.shared_text.trim()
      if (!text) {
        ctx.addIssue({
          code: 'custom',
          message: 'Введите текст SMS',
          path: ['shared_text'],
        })
      } else if (text.length > SMS_SEGMENT_LENGTH) {
        ctx.addIssue({
          code: 'custom',
          message: `Не более ${SMS_SEGMENT_LENGTH} символов`,
          path: ['shared_text'],
        })
      }
      return
    }

    data.messages.forEach((message, index) => {
      const text = message.text.trim()
      if (!text) {
        ctx.addIssue({
          code: 'custom',
          message: 'Введите текст SMS',
          path: ['messages', index, 'text'],
        })
      } else if (text.length > SMS_SEGMENT_LENGTH) {
        ctx.addIssue({
          code: 'custom',
          message: `Не более ${SMS_SEGMENT_LENGTH} символов`,
          path: ['messages', index, 'text'],
        })
      }
    })
  })

export type MailingCreateFormValues = z.infer<typeof mailingCreateSchema>
export type MessageCreateFormValues = z.infer<typeof messageCreateSchema>

export const defaultMessageValues: MessageCreateFormValues = {
  msisdn: '',
  text: '',
}

export const defaultMailingFormValues: MailingCreateFormValues = {
  provider_code: '',
  text_mode: 'same',
  shared_text: '',
  messages: [defaultMessageValues],
}
