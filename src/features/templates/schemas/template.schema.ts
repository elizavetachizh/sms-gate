import { z } from 'zod'
import { SMS_TEXT_MAX_LENGTH } from '@/shared/lib/sms-text'

export { SMS_TEXT_MAX_LENGTH }

export const templateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Введите название')
    .max(255, 'Не более 255 символов'),
  text: z
    .string()
    .trim()
    .min(1, 'Введите текст шаблона')
    .max(SMS_TEXT_MAX_LENGTH, `Не более ${SMS_TEXT_MAX_LENGTH} символов`),
})

export type TemplateFormValues = z.infer<typeof templateFormSchema>

export const defaultTemplateFormValues: TemplateFormValues = {
  name: '',
  text: '',
}
