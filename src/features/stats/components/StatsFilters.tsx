import { useState } from "react";
import type { FormEvent } from "react";
import { useProviders } from "@/features/providers/hooks/useProviders";
import { messageStatusOrder } from "@/features/stats/lib/pivot-messages-by-provider";
import {
  DEFAULT_STATS_FILL_GAPS,
  STATS_MAX_PERIOD_DAYS,
  getInclusiveDaysCount,
  isStatsDateRangeValid,
} from "@/features/stats/lib/stats-date";
import {
  MESSAGE_STATUS_LABELS,
  type MessageStatus,
  type MessagesByProviderStatsParams,
} from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";

interface StatsFiltersProps {
  value: MessagesByProviderStatsParams;
  onChange: (value: MessagesByProviderStatsParams) => void;
  className?: string;
}

interface StatsFiltersDraft {
  date_from: string;
  date_to: string;
  timezone: string;
  provider_code: string[];
  status: MessageStatus[];
  fill_gaps: boolean;
}

function paramsToDraft(
  params: MessagesByProviderStatsParams,
): StatsFiltersDraft {
  return {
    date_from: params.date_from,
    date_to: params.date_to,
    timezone: params.timezone,
    provider_code: params.provider_code ?? [],
    status: params.status ?? [],
    fill_gaps: params.fill_gaps ?? DEFAULT_STATS_FILL_GAPS,
  };
}

function draftToParams(
  draft: StatsFiltersDraft,
): MessagesByProviderStatsParams {
  return {
    date_from: draft.date_from,
    date_to: draft.date_to,
    timezone: draft.timezone.trim() || "UTC",
    provider_code:
      draft.provider_code.length > 0 ? draft.provider_code : undefined,
    status: draft.status.length > 0 ? draft.status : undefined,
    fill_gaps: draft.fill_gaps,
  };
}

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getValidationError(draft: StatsFiltersDraft): string | null {
  if (!draft.date_from || !draft.date_to) {
    return "Укажите начало и конец периода";
  }

  if (!isStatsDateRangeValid(draft.date_from, draft.date_to)) {
    const daysCount = getInclusiveDaysCount(draft.date_from, draft.date_to);

    if (daysCount < 1) {
      return "Дата окончания должна быть не раньше даты начала";
    }

    return `Период не должен превышать ${STATS_MAX_PERIOD_DAYS} дней`;
  }

  if (!draft.timezone.trim()) {
    return "Укажите timezone";
  }

  return null;
}

export function StatsFilters({
  value,
  onChange,
  className,
}: StatsFiltersProps) {
  const { data: providersData, isLoading: isProvidersLoading } = useProviders({
    enabled_only: false,
  });
  const [draft, setDraft] = useState(() => paramsToDraft(value));
  const providers = providersData?.items ?? [];
  const validationError = getValidationError(draft);

  function updateDraft(patch: Partial<StatsFiltersDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (validationError) {
      return;
    }

    onChange(draftToParams(draft));
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Фильтры статистики</CardTitle>
        <CardDescription>
          Период считается по календарным дням в выбранной timezone.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="stats-date-from">Дата с</Label>
              <Input
                id="stats-date-from"
                type="date"
                value={draft.date_from}
                onChange={(event) =>
                  updateDraft({ date_from: event.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stats-date-to">Дата по</Label>
              <Input
                id="stats-date-to"
                type="date"
                value={draft.date_to}
                onChange={(event) =>
                  updateDraft({ date_to: event.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <fieldset className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <legend className="text-sm font-medium">Провайдеры</legend>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateDraft({ provider_code: [] })}
                >
                  Все
                </Button>
              </div>

              {isProvidersLoading && <Skeleton className="h-20 w-full" />}

              {!isProvidersLoading && providers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Провайдеры не загружены, фильтр не применяется
                </p>
              )}

              {!isProvidersLoading && providers.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {providers.map((provider) => (
                    <label
                      key={provider.code}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input accent-primary"
                        checked={draft.provider_code.includes(provider.code)}
                        onChange={() =>
                          updateDraft({
                            provider_code: toggleValue(
                              draft.provider_code,
                              provider.code,
                            ),
                          })
                        }
                      />
                      <span>{provider.name}</span>
                      {!provider.is_enabled && (
                        <span className="text-xs text-muted-foreground">
                          выключен
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <legend className="text-sm font-medium">Статусы</legend>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateDraft({ status: [] })}
                >
                  Все
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {messageStatusOrder.map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input accent-primary"
                      checked={draft.status.includes(status)}
                      onChange={() =>
                        updateDraft({
                          status: toggleValue(draft.status, status),
                        })
                      }
                    />
                    <span>{MESSAGE_STATUS_LABELS[status]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={Boolean(validationError)}>
              Применить
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
