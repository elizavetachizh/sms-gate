import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  Loader2Icon,
  PlusIcon,
  RefreshCwIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";
import { EditableMailingMessagesTable } from "@/features/mailings/components/EditableMailingMessagesTable";
import { MailingProviderField } from "@/features/mailings/components/MailingProviderField";
import { MailingSendOnField } from "@/features/mailings/components/MailingSendOnField";
import { MailingStatusBadge } from "@/features/mailings/components/MailingStatusBadge";
import { useDeleteMailing } from "@/features/mailings/hooks/useDeleteMailing";
import { useMailingDetail } from "@/features/mailings/hooks/useMailingDetail";
import { useMailingProvider } from "@/features/mailings/hooks/useMailingProvider";
import { useMailingSendOn } from "@/features/mailings/hooks/useMailingSendOn";
import { useSendMailing } from "@/features/mailings/hooks/useSendMailing";
import { hasPendingMessages } from "@/features/mailings/lib/message-status";
import { defaultMailingsSearch } from "@/features/mailings/search";
import { CreateMessageDialog } from "@/features/messages/components/CreateMessageDialog";
import { isNotFoundError } from "@/shared/api";
import { getMutationErrorMessage } from "@/shared/lib/mutation-error";
import { formatDateTime, shortId } from "@/shared/lib/utils";
import { ActionAlert } from "@/shared/ui/action-alert";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { useActionAlert } from "@/shared/hooks/useActionAlert";
import { QueryLoadingPanel } from "@/shared/ui/query-loading-panel";

export function MailingDetailPage() {
  const { mailingId } = useParams({
    from: "/_authenticated/mailings/$mailingId",
  });
  const navigate = useNavigate();
  const [isCreateMessageOpen, setIsCreateMessageOpen] = useState(false);
  const [isSendMailingOpen, setIsSendMailingOpen] = useState(false);
  const [isDeleteMailingOpen, setIsDeleteMailingOpen] = useState(false);
  const { actionAlert, setActionAlert } = useActionAlert();
  const {
    data: mailing,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useMailingDetail(mailingId);
  const sendMailing = useSendMailing(mailingId);
  const deleteMailing = useDeleteMailing();
  const providerState = useMailingProvider(
    mailingId,
    mailing?.provider_code ?? "",
  );
  const sendOnState = useMailingSendOn(
    mailingId,
    providerState.savedProviderCode,
    mailing?.name ?? "",
    mailing?.send_on ?? null,
  );

  const isPolling =
    Boolean(mailing) &&
    mailing!.status !== "created" &&
    hasPendingMessages(mailing!.messages);

  const canSend = mailing?.status === "created";
  const hasMessages = Boolean(mailing?.messages.length);

  async function confirmSendMailing() {
    try {
      await sendMailing.mutateAsync();
      setIsSendMailingOpen(false);
    } catch {
      setIsSendMailingOpen(false);
    }
  }

  function confirmDeleteMailing() {
    if (!mailing) return;

    deleteMailing.mutate(mailing.id, {
      onSuccess: () => {
        setIsDeleteMailingOpen(false);
        navigate({ to: "/mailings", search: defaultMailingsSearch });
      },
      onError: (deleteError) => {
        setIsDeleteMailingOpen(false);
        setActionAlert({
          action: "error",
          entity: "mailing",
          message: getMutationErrorMessage(
            deleteError,
            "Не удалось удалить рассылку",
          ),
        });
      },
    });
  }

  if (isLoading) {
    return <QueryLoadingPanel preset="detail" />;
  }

  if (isError) {
    const isNotFound = isNotFoundError(error);

    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/mailings" search={defaultMailingsSearch}>
            <ArrowLeftIcon />К списку
          </Link>
        </Button>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            {isNotFound
              ? "Рассылка не найдена"
              : "Не удалось загрузить рассылку"}
          </p>
          {!isNotFound && (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Неизвестная ошибка"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetch()}
              >
                Повторить
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!mailing) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
            <Link to="/mailings" search={defaultMailingsSearch}>
              <ArrowLeftIcon />К списку
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            Рассылка{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-base font-normal">
              {mailing.name}
            </code>
          </h1>
          <p className="text-sm text-muted-foreground">
            {mailing.messages.length}{" "}
            {mailing.messages.length === 1 ? "сообщение" : "сообщений"}
            {isPolling && " · обновление статусов…"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <RefreshCwIcon />
            )}
            Обновить
          </Button>

          {canSend && (
            <span
              className="inline-flex"
              title={
                hasMessages ? undefined : "Добавьте хотя бы одно сообщение"
              }
            >
              <Button
                size="sm"
                disabled={sendMailing.isPending || !hasMessages}
                onClick={() => {
                  sendMailing.reset();
                  setIsSendMailingOpen(true);
                }}
              >
                {sendMailing.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <SendIcon />
                )}
                Отправить
              </Button>
            </span>
          )}

          {canSend && (
            <Button
              variant="outline"
              size="sm"
              disabled={deleteMailing.isPending}
              onClick={() => setIsDeleteMailingOpen(true)}
            >
              <Trash2Icon className="text-destructive" />
              Удалить
            </Button>
          )}
        </div>
      </div>

      {actionAlert && (
        <ActionAlert
          action={actionAlert.action}
          entity={actionAlert.entity ?? "message"}
          message={actionAlert.message}
          onDismiss={() => setActionAlert(null)}
        />
      )}

      {sendMailing.isError && (
        <ActionAlert
          action="error"
          entity="mailing"
          message={
            sendMailing.error instanceof Error
              ? sendMailing.error.message
              : "Не удалось отправить рассылку"
          }
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Информация</CardTitle>
          <CardDescription>Метаданные рассылки</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Статус</dt>
              <dd>
                <MailingStatusBadge status={mailing.status} />
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Создана</dt>
              <dd className="text-sm">{formatDateTime(mailing.created_at)}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Обновлена</dt>
              <dd className="text-sm">{formatDateTime(mailing.updated_at)}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Автор</dt>
              <dd className="text-sm" title={mailing.created_by.email}>
                {mailing.created_by.email}
              </dd>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-sm text-muted-foreground">ID</dt>
              <dd className="font-mono text-sm">{mailing.id}</dd>
            </div>
            <div className="space-y-1 sm:col-span-2 lg:col-span-3">
              <dt className="text-sm text-muted-foreground">
                Дата и время отправки
              </dt>
              <dd>
                <MailingSendOnField
                  canEdit={canSend}
                  sendOnState={sendOnState}
                  disabled={providerState.isSaving}
                  onUpdated={() =>
                    setActionAlert({ action: "updated", entity: "mailing" })
                  }
                  onError={(message) =>
                    setActionAlert({
                      action: "error",
                      entity: "mailing",
                      message,
                    })
                  }
                />
              </dd>
            </div>
            <div className="space-y-1 sm:col-span-2 lg:col-span-3">
              <dt className="text-sm text-muted-foreground">Провайдер</dt>
              <dd>
                <MailingProviderField
                  canEdit={canSend}
                  providerState={providerState}
                  onUpdated={() =>
                    setActionAlert({ action: "updated", entity: "mailing" })
                  }
                  onError={(message) =>
                    setActionAlert({
                      action: "error",
                      entity: "mailing",
                      message,
                    })
                  }
                />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Сообщения</CardTitle>
            <CardDescription>
              {canSend
                ? "Рассылка ещё не отправлена — нажмите «Отправить» для постановки в очередь."
                : "Статусы обновляются автоматически после отправки."}
            </CardDescription>
          </div>
          {canSend && (
            <Button size="sm" onClick={() => setIsCreateMessageOpen(true)}>
              <PlusIcon />
              Создать
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <EditableMailingMessagesTable
            mailingId={mailingId}
            messages={mailing.messages}
            canEdit={canSend}
            embedded
            savedProviderCode={providerState.savedProviderCode}
            isProviderBusy={providerState.isSaving || sendOnState.isSaving}
            onMessageDeleted={() =>
              setActionAlert({ action: "deleted", entity: "message" })
            }
            onMessageUpdated={() =>
              setActionAlert({ action: "updated", entity: "message" })
            }
            onDeleteError={(message) =>
              setActionAlert({ action: "error", entity: "message", message })
            }
          />
        </CardContent>
      </Card>

      <CreateMessageDialog
        mailingId={mailingId}
        open={isCreateMessageOpen}
        onOpenChange={setIsCreateMessageOpen}
        onSuccess={(count) =>
          setActionAlert({
            action: "created",
            entity: "message",
            message: count === 1 ? undefined : `Добавлено ${count} SMS`,
          })
        }
      />

      <ConfirmDialog
        open={isSendMailingOpen}
        onOpenChange={(open) => {
          if (!sendMailing.isPending) {
            setIsSendMailingOpen(open);
          }
        }}
        title={`Отправить ${mailing.messages.length} SMS?`}
        description={
          <>
            Рассылка «
            <span className="font-medium text-foreground">{mailing.name}</span>»
            будет поставлена в очередь через{" "}
            {providerState.savedProvider?.name ?? mailing.provider_code}. Это
            действие нельзя будет отменить.
          </>
        }
        confirmLabel="Отправить"
        variant="default"
        onConfirm={confirmSendMailing}
        isPending={sendMailing.isPending}
      />

      <ConfirmDialog
        open={isDeleteMailingOpen}
        onOpenChange={(open) => {
          if (!deleteMailing.isPending) {
            setIsDeleteMailingOpen(open);
          }
        }}
        title="Удалить рассылку?"
        description={
          <>
            Рассылка{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              {shortId(mailing.id)}
            </code>{" "}
            и все {mailing.messages.length}{" "}
            {mailing.messages.length === 1 ? "сообщение" : "сообщений"} будут
            удалены. Это действие нельзя будет отменить.
          </>
        }
        confirmLabel="Удалить"
        onConfirm={confirmDeleteMailing}
        isPending={deleteMailing.isPending}
      />
    </div>
  );
}
