import { useState } from "react";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { MailingsTable } from "@/features/mailings/components/MailingsTable";
import { useDeleteMailing } from "@/features/mailings/hooks/useDeleteMailing";
import { useMailingsList } from "@/features/mailings/hooks/useMailingsList";
import type { MailingRead, MailingStatus } from "@/shared/api";
import { getMutationErrorMessage } from "@/shared/lib/mutation-error";
import { shortId } from "@/shared/lib/utils";
import { ActionAlert } from "@/shared/ui/action-alert";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Pagination } from "@/shared/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useActionAlert } from "@/shared/hooks/useActionAlert";
import { QueryErrorPanel } from "@/shared/ui/query-error-panel";
import { QueryLoadingPanel } from "@/shared/ui/query-loading-panel";

const routeApi = getRouteApi("/mailings");

const STATUS_OPTIONS: { value: "all" | MailingStatus; label: string }[] = [
  { value: "all", label: "Все статусы" },
  { value: "created", label: "Создана" },
  { value: "queued", label: "В очереди" },
  { value: "submitted", label: "Отправлена" },
];

export function MailingsListPage() {
  const navigate = useNavigate({ from: "/mailings" });
  const { status, limit, offset } = routeApi.useSearch();
  const listParams = { status, limit, offset };

  const { data, isLoading, isError, error, refetch } =
    useMailingsList(listParams);
  const deleteMailing = useDeleteMailing();
  const [mailingToDelete, setMailingToDelete] = useState<MailingRead | null>(
    null,
  );
  const { actionAlert, setActionAlert } = useActionAlert();

  const statusFilter = status ?? "all";

  function updateSearch(next: {
    status?: MailingStatus | undefined;
    offset?: number;
    limit?: number;
  }) {
    navigate({
      search: (prev) => ({
        ...prev,
        ...next,
        offset: next.offset ?? (next.limit !== undefined ? 0 : prev.offset),
      }),
    });
  }

  function handleStatusChange(value: string) {
    updateSearch({
      status: value === "all" ? undefined : (value as MailingStatus),
      offset: 0,
    });
  }

  function handleDelete(mailing: MailingRead) {
    setMailingToDelete(mailing);
  }

  function confirmDeleteMailing() {
    if (!mailingToDelete) return;

    deleteMailing.mutate(mailingToDelete.id, {
      onSuccess: () => {
        setMailingToDelete(null);
        setActionAlert({ action: "deleted" });
      },
      onError: (deleteError) => {
        setActionAlert({
          action: "error",
          message: getMutationErrorMessage(
            deleteError,
            "Не удалось удалить рассылку",
          ),
        });
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Рассылки</h1>
          <p className="text-sm text-muted-foreground">
            Список SMS-рассылок с фильтрацией и пагинацией
          </p>
        </div>
        <Button asChild>
          <Link to="/mailings/new">
            <PlusIcon />
            Создать
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Статус</span>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {actionAlert && (
        <ActionAlert
          action={actionAlert.action}
          entity="mailing"
          message={actionAlert.message}
          onDismiss={() => setActionAlert(null)}
        />
      )}

      {isLoading && <QueryLoadingPanel preset="table-rows" rows={5} />}

      {isError && (
        <QueryErrorPanel
          title="Не удалось загрузить рассылки"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="rounded-lg border bg-card">
            <MailingsTable
              mailings={data.items}
              onDelete={handleDelete}
              isDeleting={deleteMailing.isPending}
            />
          </div>

          <Pagination
            total={data.total}
            limit={limit}
            offset={offset}
            onOffsetChange={(nextOffset) =>
              updateSearch({ offset: nextOffset })
            }
            onLimitChange={(nextLimit) =>
              updateSearch({ limit: nextLimit, offset: 0 })
            }
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(mailingToDelete)}
        onOpenChange={(open) => {
          if (!deleteMailing.isPending && !open) {
            setMailingToDelete(null);
          }
        }}
        title="Удалить рассылку?"
        description={
          mailingToDelete ? (
            <>
              Рассылка{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                {shortId(mailingToDelete.id)}
              </code>{" "}
              и {mailingToDelete.messages.length}{" "}
              {mailingToDelete.messages.length === 1
                ? "сообщение"
                : "сообщений"}{" "}
              будут удалены. Это действие нельзя будет отменить.
            </>
          ) : (
            "Это действие нельзя будет отменить."
          )
        }
        confirmLabel="Удалить"
        onConfirm={confirmDeleteMailing}
        isPending={deleteMailing.isPending}
      />
    </div>
  );
}
