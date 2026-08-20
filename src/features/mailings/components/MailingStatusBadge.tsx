import { MAILING_STATUS_LABELS, type MailingStatus } from "@/shared/api";
import { Badge } from "@/shared/ui/badge";

const STATUS_VARIANTS: Record<
  MailingStatus,
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

interface MailingStatusBadgeProps {
  status: MailingStatus;
}

export function MailingStatusBadge({ status }: MailingStatusBadgeProps) {
  const label = MAILING_STATUS_LABELS[status] ?? status;
  const variant = STATUS_VARIANTS[status] ?? "muted";

  return <Badge variant={variant}>{label}</Badge>;
}
