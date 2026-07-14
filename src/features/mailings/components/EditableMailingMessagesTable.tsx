import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { EditMessageDialog } from "@/features/messages/components/EditMessageDialog";
import { useDeleteMessage } from "@/features/messages/hooks/useDeleteMessage";
import { useUpdateMailing } from "@/features/mailings/hooks/useUpdateMailing";
import {
  filterMessagesExcludingIds,
  messagesToUpdatePayload,
} from "@/features/mailings/lib/mailing-messages-update";
import type { MessageRead } from "@/shared/api";
import { isConflictError, localizeConflictDetail } from "@/shared/api";
import { formatBelarusPhone } from "@/shared/lib/belarus-phone";
import { getMutationErrorMessage } from "@/shared/lib/mutation-error";
import { formatDateTime, shortId } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { MessageStatusBadge } from "./MessageStatusBadge";

interface EditableMailingMessagesTableProps {
  mailingId: string;
  messages: MessageRead[];
  canEdit?: boolean;
  embedded?: boolean;
  savedProviderCode?: string;
  isProviderBusy?: boolean;
  onMessageDeleted?: () => void;
  onMessageUpdated?: () => void;
  onDeleteError?: (message: string) => void;
}

export function EditableMailingMessagesTable({
  mailingId,
  messages,
  canEdit = false,
  embedded = false,
  savedProviderCode = "",
  isProviderBusy = false,
  onMessageDeleted,
  onMessageUpdated,
  onDeleteError,
}: EditableMailingMessagesTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [messageToDelete, setMessageToDelete] = useState<MessageRead | null>(
    null,
  );
  const [messageToEdit, setMessageToEdit] = useState<MessageRead | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const deleteMessage = useDeleteMessage(mailingId);
  const updateMailing = useUpdateMailing(mailingId);
  const isPending =
    deleteMessage.isPending || updateMailing.isPending || isProviderBusy;

  const selectableMessages = useMemo(
    () => messages.filter((message) => message.status === "created"),
    [messages],
  );

  const selectableIds = useMemo(
    () => selectableMessages.map((message) => message.id),
    [selectableMessages],
  );

  const selectedCount = selectedIds.size;
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedIds.has(id));
  const someSelected = selectableIds.some((id) => selectedIds.has(id));

  useEffect(() => {
    setSelectedIds((current) => {
      const next = new Set(
        [...current].filter((id) =>
          messages.some((message) => message.id === id),
        ),
      );

      return next.size === current.size ? current : next;
    });
  }, [messages]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  function toggleMessageSelection(messageId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(messageId);
      } else {
        next.delete(messageId);
      }
      return next;
    });
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(selectableIds) : new Set());
  }

  function confirmDelete() {
    if (!messageToDelete) return;

    deleteMessage.mutate(messageToDelete.id, {
      onSuccess: () => {
        setMessageToDelete(null);
        onMessageDeleted?.();
      },
      onError: (error) => {
        if (isConflictError(error)) {
          onDeleteError?.(localizeConflictDetail(error.detail));
          setMessageToDelete(null);
          return;
        }

        onDeleteError?.(
          error instanceof Error
            ? error.message
            : "Не удалось удалить сообщение",
        );
      },
    });
  }

  async function confirmBulkDelete() {
    if (!savedProviderCode || selectedCount === 0) return;

    try {
      const remaining = filterMessagesExcludingIds(messages, selectedIds);
      await updateMailing.replaceMessages(
        savedProviderCode,
        messagesToUpdatePayload(remaining),
      );
      setSelectedIds(new Set());
      setIsBulkDeleteOpen(false);
      onMessageDeleted?.();
    } catch (error) {
      setIsBulkDeleteOpen(false);
      onDeleteError?.(
        getMutationErrorMessage(
          error,
          "Не удалось удалить выбранные сообщения",
        ),
      );
    }
  }

  const columnCount = canEdit ? 7 : 5;

  return (
    <>
      {canEdit && messages.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {selectedCount > 0
              ? `Выбрано: ${selectedCount}`
              : "Отметьте сообщения для массового удаления"}
          </p>
          {selectedCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending || !savedProviderCode || selectedCount === 0}
              onClick={() => setIsBulkDeleteOpen(true)}
            >
              {updateMailing.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <Trash2Icon className="text-destructive" />
              )}
              Удалить выбранные
            </Button>
          )}
        </div>
      )}

      <Table className={embedded ? "text-xs" : undefined}>
        <TableHeader>
          <TableRow>
            {canEdit && (
              <TableHead className="w-10">
                <Checkbox
                  ref={selectAllRef}
                  aria-label="Выбрать все сообщения"
                  checked={allSelected}
                  disabled={isPending || selectableIds.length === 0}
                  onChange={(event) => toggleSelectAll(event.target.checked)}
                />
              </TableHead>
            )}
            <TableHead>Номер</TableHead>
            <TableHead>Текст</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Отправка</TableHead>
            <TableHead>External ID</TableHead>
            {canEdit && <TableHead>Действия</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.length ? (
            messages.map((message) => {
              const isSelectable = canEdit && message.status === "created";
              const isSelected = selectedIds.has(message.id);

              return (
                <TableRow
                  key={message.id}
                  data-state={isSelected ? "selected" : undefined}
                >
                  {canEdit && (
                    <TableCell>
                      {isSelectable ? (
                        <Checkbox
                          aria-label={`Выбрать сообщение ${formatBelarusPhone(message.msisdn) || message.msisdn}`}
                          checked={isSelected}
                          disabled={isPending}
                          onChange={(event) =>
                            toggleMessageSelection(
                              message.id,
                              event.target.checked,
                            )
                          }
                        />
                      ) : (
                        <span className="inline-block size-4" aria-hidden />
                      )}
                    </TableCell>
                  )}
                  <TableCell className="whitespace-nowrap font-mono text-sm">
                    {formatBelarusPhone(message.msisdn) || message.msisdn}
                  </TableCell>
                  <TableCell
                    title={message.text}
                    className={
                      embedded ? "max-w-[240px] truncate" : "max-w-xs truncate"
                    }
                  >
                    {message.text}
                  </TableCell>
                  <TableCell>
                    <MessageStatusBadge status={message.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {message.send_on ? formatDateTime(message.send_on) : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {message.external_id ? (
                      <span title={message.external_id}>
                        {shortId(message.external_id)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  {canEdit && message.status === "created" && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => setMessageToEdit(message)}
                          aria-label="Редактировать сообщение"
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => setMessageToDelete(message)}
                          aria-label="Удалить сообщение"
                        >
                          {deleteMessage.isPending &&
                          messageToDelete?.id === message.id ? (
                            <Loader2Icon className="animate-spin text-destructive" />
                          ) : (
                            <Trash2Icon className="text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  {canEdit && message.status !== "created" && (
                    <TableCell>—</TableCell>
                  )}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                className="h-24 text-center text-muted-foreground"
              >
                Сообщений нет
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setIsBulkDeleteOpen(open);
          }
        }}
        title="Удалить выбранные сообщения?"
        description={
          <>
            Будет удалено {selectedCount}{" "}
            {selectedCount === 1 ? "сообщение" : "сообщений"}. Это действие
            нельзя отменить.
          </>
        }
        confirmLabel="Удалить"
        onConfirm={confirmBulkDelete}
        isPending={isPending}
      />

      <ConfirmDialog
        open={Boolean(messageToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMessage.isPending) {
            setMessageToDelete(null);
          }
        }}
        title="Удалить сообщение?"
        description={
          messageToDelete ? (
            <>
              Номер{" "}
              <span className="font-mono font-medium text-foreground">
                {formatBelarusPhone(messageToDelete.msisdn) ||
                  messageToDelete.msisdn}
              </span>
              . Это действие нельзя отменить.
            </>
          ) : (
            "Это действие нельзя отменить."
          )
        }
        confirmLabel="Удалить"
        onConfirm={confirmDelete}
        isPending={deleteMessage.isPending}
      />

      <EditMessageDialog
        mailingId={mailingId}
        message={messageToEdit}
        open={Boolean(messageToEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setMessageToEdit(null);
          }
        }}
        onSuccess={() => {
          setMessageToEdit(null);
          onMessageUpdated?.();
        }}
      />
    </>
  );
}
