import type { MessageStatus } from "@/shared/api";
import { Badge } from "@/shared/ui/badge";

const STATUS_LABELS: Record<MessageStatus, string> = {
  created: "Создано",
  queued: "В очереди",
  submitted: "Передано",
  delivered: "Доставлено",
  undelivered: "Не доставлено",
  failed: "Ошибка",
  unknown: "Неизвестно",
};

const STATUS_VARIANTS: Record<
  MessageStatus,
  "muted" | "warning" | "success" | "secondary" | "outline"
> = {
  created: "muted",
  queued: "warning",
  submitted: "warning",
  delivered: "success",
  undelivered: "secondary",
  failed: "outline",
  unknown: "muted",
};

interface MessageStatusBadgeProps {
  status: MessageStatus;
}

export function MessageStatusBadge({ status }: MessageStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  );
}
