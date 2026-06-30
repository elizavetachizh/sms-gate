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

export const messageCreateSchema = z.object({
  msisdn: msisdnSchema,
  text: z
    .string()
    .trim()
    .min(1, 'Введите текст SMS')
    .max(1600, 'Не более 1600 символов'),
})

export const mailingCreateSchema = z.object({
  provider_code: z.string().min(1, 'Выберите провайдера'),
  messages: z.array(messageCreateSchema).min(1, 'Добавьте хотя бы одно сообщение'),
})

export type MailingCreateFormValues = z.infer<typeof mailingCreateSchema>
export type MessageCreateFormValues = z.infer<typeof messageCreateSchema>

export const defaultMessageValues: MessageCreateFormValues = {
  msisdn: '',
  text: '',
}

export const defaultMailingFormValues: MailingCreateFormValues = {
  provider_code: '',
  messages: [defaultMessageValues],
}
