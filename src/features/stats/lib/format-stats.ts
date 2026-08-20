import type { MessagesByProviderSeries } from "@/features/stats/lib/pivot-messages-by-provider";
import { MESSAGE_STATUS_LABELS } from "@/shared/api";

function parseStatsDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

export function formatDateLabel(date: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }).format(parseStatsDate(date));
}

export function formatFullDateLabel(date: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parseStatsDate(date));
}

export function getSeriesLabel(
  series: Pick<
    MessagesByProviderSeries,
    "provider_name" | "provider_code" | "status"
  >,
): string {
  return `${series.provider_name ?? series.provider_code} / ${MESSAGE_STATUS_LABELS[series.status]}`;
}
