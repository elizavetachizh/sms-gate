import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatDateLabel,
  formatFullDateLabel,
  getSeriesLabel,
} from "@/features/stats/lib/format-stats";
import type { MessagesByProviderPivot } from "@/features/stats/lib/pivot-messages-by-provider";
import { cn } from "@/shared/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

interface MessagesByProviderChartProps {
  pivot: MessagesByProviderPivot | null;
  isLoading?: boolean;
  error?: unknown;
  className?: string;
}

type ChartRow = {
  date: string;
  total: number;
} & Record<string, string | number>;

interface ChartTooltipPayload {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: unknown;
  payload?: ChartTooltipPayload[];
}

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#4f46e5",
];

function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length || typeof label !== "string") {
    return null;
  }

  const visiblePayload = payload.filter((item) => Number(item.value) > 0);
  const total = visiblePayload.reduce(
    (sum, item) => sum + Number(item.value ?? 0),
    0,
  );

  return (
    <div className="min-w-48 rounded-lg border bg-card p-3 text-sm shadow-md">
      <p className="font-medium">{formatFullDateLabel(label)}</p>
      <p className="mt-1 text-xs text-muted-foreground">Всего SMS: {total}</p>

      {visiblePayload.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {visiblePayload.map((item) => (
            <div
              key={String(item.dataKey)}
              className="flex items-center justify-between gap-4"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{String(item.name)}</span>
              </span>
              <span className="font-medium tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MessagesByProviderChart({
  pivot,
  isLoading = false,
  error,
  className,
}: MessagesByProviderChartProps) {
  const chartData = useMemo<ChartRow[]>(() => {
    if (!pivot) {
      return [];
    }

    return pivot.dates.map((date, index) => {
      const row: ChartRow = {
        date,
        total: pivot.totalsByDate[date] ?? 0,
      };

      for (const series of pivot.series) {
        row[series.key] = series.data[index] ?? 0;
      }

      return row;
    });
  }, [pivot]);

  const isError = Boolean(error);
  const hasData = Boolean(pivot && pivot.total > 0);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>SMS по провайдерам</CardTitle>
        <CardDescription>
          Количество сообщений по дням, провайдерам и статусам.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading && <Skeleton className="h-80 w-full" />}

        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              Не удалось загрузить статистику
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Неизвестная ошибка"}
            </p>
          </div>
        )}

        {!isLoading && !isError && !hasData && (
          <div className="flex h-80 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              За выбранный период данных нет
            </p>
          </div>
        )}

        {!isLoading && !isError && hasData && pivot && (
          <div className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "hsl(var(--muted))" }}
                  />
                  {pivot.series.map((series, index) => (
                    <Bar
                      key={series.key}
                      dataKey={series.key}
                      name={getSeriesLabel(series)}
                      stackId="messages"
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2">
              {pivot.series.map((series, index) => (
                <div
                  key={series.key}
                  className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{
                      backgroundColor:
                        CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                  <span>{getSeriesLabel(series)}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {series.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
