import { XIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  getActionAlertContent,
  type ActionAlertEntity,
  type ActionAlertType,
} from "@/shared/ui/action-alert-content";

export type {
  ActionAlertEntity,
  ActionAlertType,
} from "@/shared/ui/action-alert-content";

interface ActionAlertProps {
  action: ActionAlertType;
  entity?: ActionAlertEntity;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}

export function ActionAlert({
  action,
  entity,
  message,
  onDismiss,
  className,
}: ActionAlertProps) {
  const content = getActionAlertContent(action, { entity, message });
  const Icon = content.icon;

  return (
    <Alert
      variant={content.variant}
      className={cn(onDismiss && "pr-12", className)}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        <AlertTitle>{content.title}</AlertTitle>
        <AlertDescription>{content.description}</AlertDescription>
      </div>
      {onDismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 size-8",
            content.variant === "destructive"
              ? "text-red-700 hover:bg-red-100 hover:text-red-900 dark:text-red-300 dark:hover:bg-red-950 dark:hover:text-red-100"
              : "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950 dark:hover:text-emerald-100",
          )}
          onClick={onDismiss}
          aria-label="Закрыть"
        >
          <XIcon className="size-4" />
        </Button>
      )}
    </Alert>
  );
}
