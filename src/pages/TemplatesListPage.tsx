import { useState } from "react";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { TemplatesTable } from "@/features/templates/components/TemplatesTable";
import { useDeleteTemplate } from "@/features/templates/hooks/useDeleteTemplate";
import { useTemplatesList } from "@/features/templates/hooks/useTemplatesList";
import type { MailingTemplateRead } from "@/shared/api";
import { getMutationErrorMessage } from "@/shared/lib/mutation-error";
import { ActionAlert } from "@/shared/ui/action-alert";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Pagination } from "@/shared/ui/pagination";
import { useActionAlert } from "@/shared/hooks/useActionAlert";
import { QueryErrorPanel } from "@/shared/ui/query-error-panel";
import { QueryLoadingPanel } from "@/shared/ui/query-loading-panel";

const routeApi = getRouteApi("/_authenticated/templates");

export function TemplatesListPage() {
  const navigate = useNavigate({ from: "/templates" });
  const { limit, offset } = routeApi.useSearch();
  const listParams = { limit, offset };

  const { data, isLoading, isError, error, refetch } =
    useTemplatesList(listParams);
  const deleteTemplate = useDeleteTemplate();
  const [templateToDelete, setTemplateToDelete] =
    useState<MailingTemplateRead | null>(null);
  const { actionAlert, setActionAlert } = useActionAlert();

  function updatePagination(next: { offset?: number; limit?: number }) {
    navigate({
      search: (prev) => ({
        ...prev,
        ...next,
        offset: next.offset ?? (next.limit !== undefined ? 0 : prev.offset),
      }),
    });
  }

  function handleDelete(template: MailingTemplateRead) {
    setTemplateToDelete(template);
  }

  function confirmDeleteTemplate() {
    if (!templateToDelete) return;

    deleteTemplate.mutate(templateToDelete.id, {
      onSuccess: () => {
        setTemplateToDelete(null);
        setActionAlert({ action: "deleted" });
      },
      onError: (deleteError) => {
        setActionAlert({
          action: "error",
          message: getMutationErrorMessage(
            deleteError,
            "Не удалось удалить шаблон",
          ),
        });
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Шаблоны</h1>
          <p className="text-sm text-muted-foreground">
            Сохранённые тексты SMS для быстрого создания рассылок
          </p>
        </div>
        <Button asChild>
          <Link to="/templates/new">
            <PlusIcon />
            Создать
          </Link>
        </Button>
      </div>

      {actionAlert && (
        <ActionAlert
          action={actionAlert.action}
          entity="template"
          message={actionAlert.message}
          onDismiss={() => setActionAlert(null)}
        />
      )}
      {isLoading && <QueryLoadingPanel preset="table-rows" rows={5} />}

      {isError && (
        <QueryErrorPanel
          title="Не удалось загрушить шаблоны"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="rounded-lg border bg-card">
            <TemplatesTable
              templates={data.items}
              onDelete={handleDelete}
              isDeleting={deleteTemplate.isPending}
            />
          </div>

          <Pagination
            total={data.total}
            limit={limit}
            offset={offset}
            onOffsetChange={(nextOffset) =>
              updatePagination({ offset: nextOffset })
            }
            onLimitChange={(nextLimit) =>
              updatePagination({ limit: nextLimit, offset: 0 })
            }
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(templateToDelete)}
        onOpenChange={(open) => {
          if (!deleteTemplate.isPending && !open) {
            setTemplateToDelete(null);
          }
        }}
        title="Удалить шаблон?"
        description={
          templateToDelete ? (
            <>
              Шаблон «
              <span className="font-medium text-foreground">
                {templateToDelete.name}
              </span>
              » будет удалён. Это действие нельзя будет отменить.
            </>
          ) : (
            "Это действие нельзя будет отменить."
          )
        }
        confirmLabel="Удалить"
        onConfirm={confirmDeleteTemplate}
        isPending={deleteTemplate.isPending}
      />
    </div>
  );
}
