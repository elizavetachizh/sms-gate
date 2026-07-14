import { AlertTriangleIcon } from "lucide-react";
import {
  formatSmsAnalysisSummary,
  getSmsAnalysisWarnings,
} from "@/shared/sms/format-sms-analysis";
import { useSmsTextAnalysis } from "@/shared/sms/useSmsTextAnalysis";
import { cn } from "@/shared/lib/utils";
import { Alert, AlertDescription } from "@/shared/ui/alert";

interface SmsTextAnalysisPartProps {
  text: string;
  className?: string;
}

export function SmsTextAnalysisSummary({
  text,
  className,
}: SmsTextAnalysisPartProps) {
  const trimmedText = text.trim();
  const { data, isFetching, isError } = useSmsTextAnalysis(text);

  if (trimmedText.length === 0) {
    return null;
  }

  if (isError) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Не удалось рассчитать длину SMS
      </p>
    );
  }

  if (!data) {
    return (
      <p
        className={cn("text-xs text-muted-foreground", className)}
        aria-live="polite"
      >
        {isFetching ? "Расчёт…" : null}
      </p>
    );
  }

  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        data.characters > data.capacity
          ? "font-medium text-destructive"
          : "text-muted-foreground",
      )}
      aria-live="polite"
    >
      {formatSmsAnalysisSummary(data)}
    </span>
  );
}

export function SmsTextAnalysisWarnings({
  text,
  className,
}: SmsTextAnalysisPartProps) {
  const trimmedText = text.trim();
  const { data } = useSmsTextAnalysis(text);

  if (trimmedText.length === 0 || !data) {
    return null;
  }

  const warnings = getSmsAnalysisWarnings(data);

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {warnings.map((warning) => (
        <Alert key={warning.id} variant="warning">
          <AlertTriangleIcon />
          <AlertDescription>{warning.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
