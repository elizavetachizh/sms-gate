import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { useMe } from "@/features/auth/hooks/useMe";
import { isAdmin } from "@/features/auth/is-admin";
import { useUpdateProvider } from "@/features/providers/hooks/useUpdateProvider";
import { isValidationError } from "@/shared/api";
import { mapValidationErrors } from "@/shared/api/map-validation-errors";
import type { ProviderRead } from "@/shared/api";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

interface ProviderCardProps {
  provider: ProviderRead;
  isUpdating: boolean;
  updatingCode: string | null;
  onUpdate: ReturnType<typeof useUpdateProvider>["mutateAsync"];
}

interface ProviderNameEditorProps {
  provider: ProviderRead;
  isThisUpdating: boolean;
  onUpdate: ProviderCardProps["onUpdate"];
}

function ProviderNameEditor({
  provider,
  isThisUpdating,
  onUpdate,
}: ProviderNameEditorProps) {
  const [name, setName] = useState(provider.name);
  const [error, setError] = useState<string | null>(null);

  const isNameDirty = name.trim() !== provider.name;

  async function handleSaveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === provider.name) return;

    setError(null);

    try {
      await onUpdate({ code: provider.code, payload: { name: trimmed } });
    } catch (err) {
      if (isValidationError(err)) {
        const messages = Object.values(mapValidationErrors(err.details));
        setError(messages[0] ?? "Не удалось сохранить имя");
        return;
      }

      setError(err instanceof Error ? err.message : "Не удалось сохранить имя");
    }
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`provider-name-${provider.code}`}>
          Отображаемое имя
        </Label>
        <Input
          id={`provider-name-${provider.code}`}
          value={name}
          disabled={isThisUpdating}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSaveName();
            }
          }}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <CardFooter className="px-0 pb-0">
        <Button
          type="button"
          size="sm"
          disabled={!isNameDirty || isThisUpdating || !name.trim()}
          onClick={() => void handleSaveName()}
        >
          {isThisUpdating ? (
            <>
              <Loader2Icon className="animate-spin" />
              Сохранение…
            </>
          ) : (
            "Сохранить имя"
          )}
        </Button>
      </CardFooter>
    </>
  );
}

export function ProviderCard({
  provider,
  isUpdating,
  updatingCode,
  onUpdate,
}: ProviderCardProps) {
  const { data: me } = useMe();
  const canEdit = isAdmin(me);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const isThisUpdating = isUpdating && updatingCode === provider.code;
  const isConfigured = provider.max_batch_size > 0;

  async function handleToggleEnabled(nextEnabled: boolean) {
    setToggleError(null);

    try {
      await onUpdate({
        code: provider.code,
        payload: { is_enabled: nextEnabled },
      });
    } catch (err) {
      setToggleError(
        err instanceof Error ? err.message : "Не удалось изменить статус",
      );
    }
  }

  return (
    <Card className={!provider.is_enabled ? "opacity-90" : undefined}>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-lg">{provider.name}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant={provider.is_enabled ? "success" : "muted"}>
              {provider.is_enabled ? "Включён" : "Выключен"}
            </Badge>
            {!isConfigured && <Badge variant="warning">Не настроен</Badge>}
          </div>
        </div>
        <CardDescription>
          Код:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {provider.code}
          </code>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Макс. batch</dt>
            <dd className="font-medium tabular-nums">
              {provider.max_batch_size}
            </dd>
          </div>
        </dl>

        {canEdit && (
          <>
            <ProviderNameEditor
              key={provider.name}
              provider={provider}
              isThisUpdating={isThisUpdating}
              onUpdate={onUpdate}
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3">
              <input
                type="checkbox"
                className="size-4 rounded border-input accent-primary"
                checked={provider.is_enabled}
                disabled={isThisUpdating}
                onChange={(event) =>
                  void handleToggleEnabled(event.target.checked)
                }
              />
              <span className="text-sm leading-snug">
                Доступен для новых рассылок
              </span>
            </label>

            {toggleError && (
              <p className="text-sm text-destructive">{toggleError}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
