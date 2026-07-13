import { type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

export type QueryLoadingPreset =
  | "table-rows"
  | "detail"
  | "cards-grid"
  | "chart"
  | "form"
  | "table";

type QueryLoadingPanelProps = {
  preset?: QueryLoadingPreset;
  rows?: number;
  cards?: number;
  className?: string;
  children?: ReactNode;
};

function TableRowsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function CardsGridSkeleton({ cards }: { cards: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <Skeleton key={index} className="h-64 w-full rounded-xl" />
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function renderPreset(
  preset: QueryLoadingPreset,
  rows: number,
  cards: number,
): ReactNode {
  switch (preset) {
    case "table-rows":
      return <TableRowsSkeleton rows={rows} />;
    case "detail":
      return <DetailSkeleton />;
    case "cards-grid":
      return <CardsGridSkeleton cards={cards} />;
    case "chart":
      return <Skeleton className="h-80 w-full" />;
    case "form":
      return <FormSkeleton />;
    case "table":
      return <Skeleton className="h-64 w-full" />;
  }
}

export function QueryLoadingPanel({
  preset = "table-rows",
  rows = 5,
  cards = 3,
  className,
  children,
}: QueryLoadingPanelProps) {
  return (
    <div aria-busy="true" className={cn(className)}>
      {children ?? renderPreset(preset, rows, cards)}
    </div>
  );
}
