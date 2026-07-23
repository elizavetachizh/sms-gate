import { Loader2Icon } from "lucide-react";
import type { useMailingProvider } from "@/features/mailings/hooks/useMailingProvider";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";

type MailingProviderState = ReturnType<typeof useMailingProvider>;

interface MailingProviderFieldProps {
  canEdit: boolean;
  providerState: MailingProviderState;
  onUpdated?: () => void;
  onError?: (message: string) => void;
}

export function MailingProviderField({
  canEdit,
  providerState,
  onUpdated,
  onError,
}: MailingProviderFieldProps) {
  const {
    providers,
    providerCode,
    savedProvider,
    setProviderCode,
    hasProviderChange,
    isProvidersLoading,
    isProvidersError,
    isSaving,
    saveProvider,
  } = providerState;

  async function handleSaveProvider() {
    try {
      await saveProvider();
      onUpdated?.();
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить провайдера",
      );
    }
  }

  if (isProvidersLoading) {
    return <Skeleton className="h-9 w-full max-w-xs" />;
  }

  if (isProvidersError) {
    return (
      <p className="text-sm text-destructive">
        Не удалось загрузить список провайдеров
      </p>
    );
  }

  if (providers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Провайдеры не найдены</p>
    );
  }

  if (!canEdit) {
    return (
      <p className="text-sm">
        {savedProvider?.name ?? providerCode}
        {savedProvider && (
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            {savedProvider.code}
          </span>
        )}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={providerCode} onValueChange={setProviderCode}>
          <SelectTrigger id="mailing-provider" className="max-w-xs">
            <SelectValue placeholder="Выберите провайдера" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.code} value={provider.code}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          size="sm"
          disabled={!hasProviderChange || isSaving}
          onClick={handleSaveProvider}
        >
          {isSaving && <Loader2Icon className="animate-spin" />}
          Сохранить
        </Button>
      </div>
      <Label htmlFor="mailing-provider" className="sr-only">
        Провайдер
      </Label>
    </div>
  );
}
