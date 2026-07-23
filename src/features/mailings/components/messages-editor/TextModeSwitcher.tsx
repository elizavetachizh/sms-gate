import { TEXT_MODE_OPTIONS } from "@/features/mailings/components/messages-editor/constants";
import type { MailingTextMode } from "@/features/mailings/schemas/mailing.schema";
import { cn } from "@/shared/lib/utils";

interface TextModeSwitcherProps {
  textMode: MailingTextMode;
  onChange: (mode: MailingTextMode) => void;
}

export function TextModeSwitcher({ textMode, onChange }: TextModeSwitcherProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Режим сообщений</legend>

      <div
        className="grid gap-3 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Режим сообщений"
      >
        {TEXT_MODE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = textMode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-foreground bg-muted/50 shadow-sm"
                  : "border-border bg-background",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border",
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-muted text-muted-foreground",
                )}
                aria-hidden
              >
                <Icon className="size-4" />
              </span>

              <span className="min-w-0 space-y-1">
                <span className="block text-sm font-medium leading-none">
                  {option.label}
                </span>
                <span className="block text-sm leading-snug text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
