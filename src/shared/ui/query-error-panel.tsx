import { Button } from "./button";

type QueryErrorPanelProps = {
  title: string;
  error?: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function QueryErrorPanel({
  title,
  error,
  onRetry,
  retryLabel = "Повторить",
  className,
}: QueryErrorPanelProps) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm font-medium text-destructive">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "Неизвестная ошибка"}
      </p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}
