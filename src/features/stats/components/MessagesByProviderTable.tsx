import {
  type MessagesByProviderPivot,
  type MessagesByProviderSeries,
} from "@/features/stats/lib/pivot-messages-by-provider";
import { MESSAGE_STATUS_LABELS } from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

interface MessagesByProviderTableProps {
  pivot: MessagesByProviderPivot | null;
  isLoading?: boolean;
  error?: unknown;
  className?: string;
}

function formatDateLabel(date: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getSeriesLabel(series: MessagesByProviderSeries): string {
  return `${series.provider_name ?? series.provider_code} / ${MESSAGE_STATUS_LABELS[series.status]}`;
}

export function MessagesByProviderTable({
  pivot,
  isLoading = false,
  error,
  className,
}: MessagesByProviderTableProps) {
  const isError = Boolean(error);
  const hasData = Boolean(pivot && pivot.total > 0);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>Детализация SMS</CardTitle>
        <CardDescription>
          Таблица агрегированных сообщений по датам, провайдерам и статусам.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading && <Skeleton className="h-64 w-full" />}

        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              Не удалось загрузить детализацию
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Неизвестная ошибка"}
            </p>
          </div>
        )}

        {!isLoading && !isError && !hasData && (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              За выбранный период данных нет
            </p>
          </div>
        )}

        {!isLoading && !isError && hasData && pivot && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-card">
                  Дата
                </TableHead>
                {pivot.series.map((series) => (
                  <TableHead key={series.key} className="min-w-40 text-right">
                    {getSeriesLabel(series)}
                  </TableHead>
                ))}
                <TableHead className="text-right">Всего</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pivot.dates.map((date, dateIndex) => (
                <TableRow key={date}>
                  <TableCell className="sticky left-0 z-10 bg-card font-medium">
                    {formatDateLabel(date)}
                  </TableCell>
                  {pivot.series.map((series) => (
                    <TableCell
                      key={series.key}
                      className="text-right tabular-nums"
                    >
                      {series.data[dateIndex] ?? 0}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-medium tabular-nums">
                    {pivot.totalsByDate[date] ?? 0}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell className="sticky left-0 z-10 bg-card font-semibold">
                  Итого
                </TableCell>
                {pivot.series.map((series) => (
                  <TableCell
                    key={series.key}
                    className="text-right font-semibold tabular-nums"
                  >
                    {series.total}
                  </TableCell>
                ))}
                <TableCell className="text-right font-semibold tabular-nums">
                  {pivot.total}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
