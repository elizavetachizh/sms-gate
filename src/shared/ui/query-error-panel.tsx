import { cn } from "@/shared/lib/utils";
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
    <div
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/5 p-4",
        className,
      )}
    >
      <p className="text-sm font-medium text-destructive">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "Неизвестная ошибка"}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
