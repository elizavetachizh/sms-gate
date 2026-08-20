import { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { CreateUserDialog } from "@/features/users/components/CreateUserDialog";
import { ChangePasswordDialog } from "@/features/users/components/ChangePasswordDialog";
import { EditUserDialog } from "@/features/users/components/EditUserDialog";
import { UsersTable } from "@/features/users/components/UsersTable";
import { useUsersList } from "@/features/users/hooks/useUsersList";
import { useActionAlert } from "@/shared/hooks/useActionAlert";
import { usePageSearch } from "@/shared/hooks/usePageSearch";
import type { UserRead } from "@/shared/api";
import { ActionAlert } from "@/shared/ui/action-alert";
import { Button } from "@/shared/ui/button";
import { Pagination } from "@/shared/ui/pagination";
import { QueryErrorPanel } from "@/shared/ui/query-error-panel";
import { QueryLoadingPanel } from "@/shared/ui/query-loading-panel";

const routeApi = getRouteApi("/_authenticated/users");

export function UsersListPage() {
  const { updateSearch } = usePageSearch("/users");
  const { limit, offset } = routeApi.useSearch();
  const listParams = { limit, offset };

  const { data, isLoading, isError, error, refetch } = useUsersList(listParams);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserRead | null>(null);
  const [userToChangePassword, setUserToChangePassword] =
    useState<UserRead | null>(null);
  const { actionAlert, setActionAlert } = useActionAlert();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Пользователи
          </h1>
          <p className="text-sm text-muted-foreground">
            Учётные записи для входа в SMS Gate
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <PlusIcon />
          Создать
        </Button>
      </div>

      {actionAlert && (
        <ActionAlert
          action={actionAlert.action}
          entity="user"
          message={actionAlert.message}
          onDismiss={() => setActionAlert(null)}
        />
      )}

      {isLoading && <QueryLoadingPanel preset="table-rows" rows={5} />}

      {isError && (
        <QueryErrorPanel
          title="Не удалось загрузить пользователей"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="rounded-lg border bg-card">
            <UsersTable
              users={data.items}
              onEdit={setUserToEdit}
              onChangePassword={setUserToChangePassword}
            />
          </div>

          <Pagination
            total={data.total}
            limit={limit}
            offset={offset}
            onOffsetChange={(nextOffset) =>
              updateSearch({ offset: nextOffset })
            }
            onLimitChange={(nextLimit) => updateSearch({ limit: nextLimit })}
          />
        </>
      )}

      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => setActionAlert({ action: "created" })}
      />

      <EditUserDialog
        user={userToEdit}
        open={Boolean(userToEdit)}
        onOpenChange={(open) => {
          if (!open) setUserToEdit(null);
        }}
        onSuccess={() => setActionAlert({ action: "updated" })}
      />

      <ChangePasswordDialog
        user={userToChangePassword}
        open={Boolean(userToChangePassword)}
        onOpenChange={(open) => {
          if (!open) setUserToChangePassword(null);
        }}
        onSuccess={() => setActionAlert({ action: "updated" })}
      />
    </div>
  );
}
