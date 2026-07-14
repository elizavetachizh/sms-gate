import type { MailingStatus } from "@/shared/api";
import { Badge } from "@/shared/ui/badge";

const STATUS_LABELS: Record<MailingStatus, string> = {
  created: "Создана",
  queued: "В очереди",
  submitted: "Отправлена",
};

const STATUS_VARIANTS: Record<MailingStatus, "muted" | "warning" | "success"> =
  {
    created: "muted",
    queued: "warning",
    submitted: "success",
  };

interface MailingStatusBadgeProps {
  status: MailingStatus;
}

export function MailingStatusBadge({ status }: MailingStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  );
}
