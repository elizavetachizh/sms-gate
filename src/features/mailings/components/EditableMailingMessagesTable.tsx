import { useState } from 'react'
import { Loader2Icon, PencilIcon, Trash2Icon } from 'lucide-react'
import { EditMessageDialog } from '@/features/messages/components/EditMessageDialog'
import { useDeleteMessage } from '@/features/messages/hooks/useDeleteMessage'
import type { MessageRead } from '@/shared/api'
import { isConflictError, localizeConflictDetail } from '@/shared/api'
import { formatBelarusPhone } from '@/shared/lib/belarus-phone'
import { formatDateTime, shortId } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { MessageStatusBadge } from './MessageStatusBadge'

interface EditableMailingMessagesTableProps {
  mailingId: string
  messages: MessageRead[]
  canEdit?: boolean
  embedded?: boolean
  onMessageDeleted?: () => void
  onMessageUpdated?: () => void
  onDeleteError?: (message: string) => void
}

export function EditableMailingMessagesTable({
  mailingId,
  messages,
  canEdit = false,
  embedded = false,
  onMessageDeleted,
  onMessageUpdated,
  onDeleteError,
}: EditableMailingMessagesTableProps) {
  const [messageToDelete, setMessageToDelete] = useState<MessageRead | null>(null)
  const [messageToEdit, setMessageToEdit] = useState<MessageRead | null>(null)
  const deleteMessage = useDeleteMessage(mailingId)

  function confirmDelete() {
    if (!messageToDelete) return

    deleteMessage.mutate(messageToDelete.id, {
      onSuccess: () => {
        setMessageToDelete(null)
        onMessageDeleted?.()
      },
      onError: (error) => {
        if (isConflictError(error)) {
          onDeleteError?.(localizeConflictDetail(error.detail))
          setMessageToDelete(null)
          return
        }

        onDeleteError?.(
          error instanceof Error ? error.message : 'Не удалось удалить сообщение',
        )
      },
    })
  }

  return (
    <>
      <Table className={embedded ? 'text-xs' : undefined}>
        <TableHeader>
          <TableRow>
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
            messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell className="whitespace-nowrap font-mono text-sm">
                  {formatBelarusPhone(message.msisdn) || message.msisdn}
                </TableCell>
                <TableCell
                  title={message.text}
                  className={
                    embedded ? 'max-w-[240px] truncate' : 'max-w-xs truncate'
                  }
                >
                  {message.text}
                </TableCell>
                <TableCell>
                  <MessageStatusBadge status={message.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {message.send_on ? formatDateTime(message.send_on) : '—'}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {message.external_id ? (
                    <span title={message.external_id}>
                      {shortId(message.external_id)}
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>
                {canEdit && message.status === 'created' && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deleteMessage.isPending}
                        onClick={() => setMessageToEdit(message)}
                        aria-label="Редактировать сообщение"
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deleteMessage.isPending}
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
                {canEdit && message.status !== 'created' && <TableCell>—</TableCell>}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={canEdit ? 6 : 5}
                className="h-24 text-center text-muted-foreground"
              >
                Сообщений нет
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={Boolean(messageToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMessage.isPending) {
            setMessageToDelete(null)
          }
        }}
        title="Удалить сообщение?"
        description={
          messageToDelete ? (
            <>
              Номер{' '}
              <span className="font-mono font-medium text-foreground">
                {formatBelarusPhone(messageToDelete.msisdn) || messageToDelete.msisdn}
              </span>
              . Это действие нельзя отменить.
            </>
          ) : (
            'Это действие нельзя отменить.'
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
            setMessageToEdit(null)
          }
        }}
        onSuccess={() => {
          setMessageToEdit(null)
          onMessageUpdated?.()
        }}
      />
    </>
  )
}
