import type { LucideIcon } from 'lucide-react'
import { MessageSquareIcon, MessagesSquareIcon } from 'lucide-react'
import type { MailingTextMode } from '@/features/mailings/schemas/mailing.schema'

export interface TextModeOption {
  value: MailingTextMode
  label: string
  description: string
  icon: LucideIcon
}

export const TEXT_MODE_OPTIONS: TextModeOption[] = [
  {
    value: 'same',
    label: 'Один текст',
    description: 'Один SMS всем получателям — укажите текст и список номеров',
    icon: MessageSquareIcon,
  },
  {
    value: 'different',
    label: 'Разный текст',
    description: 'У каждого получателя свой текст сообщения',
    icon: MessagesSquareIcon,
  },
]
