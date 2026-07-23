import type { LucideIcon } from "lucide-react";
import { MessageSquareIcon, MessagesSquareIcon } from "lucide-react";
import type { MailingTextMode } from "@/features/mailings/schemas/mailing.schema";

export interface TextModeOption {
  value: MailingTextMode;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
}

export const TEXT_MODE_OPTIONS: TextModeOption[] = [
  {
    value: "same",
    label: "Один текст всем",
    shortLabel: "Одинаковый текст",
    description: "Одинаковое сообщение для всех получателей",
    icon: MessageSquareIcon,
  },
  {
    value: "different",
    label: "Свой текст каждому",
    shortLabel: "Различные тексты",
    description: "Различные сообщения для каждого получателя",
    icon: MessagesSquareIcon,
  },
];
