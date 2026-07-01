import type { MessageRead } from '@/shared/api'
import { formatDateTime, shortId } from '@/shared/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { MessageStatusBadge } from './MessageStatusBadge'

interface MailingMessagesTableProps {
  messages: MessageRead[]
  embedded?: boolean
}

export function MailingMessagesTable({
  messages,
  embedded = false,
}: MailingMessagesTableProps) {
  return (
    <Table className={embedded ? 'text-xs' : undefined}>
      <TableHeader>
        <TableRow>
          <TableHead>Номер</TableHead>
          <TableHead>Текст</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Отправка</TableHead>
          <TableHead>External ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.length ? (
          messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell className="whitespace-nowrap font-mono text-sm">
                {message.msisdn}
              </TableCell>
              <TableCell
                title={message.text}
                className={embedded ? 'max-w-[240px] truncate' : 'max-w-xs truncate'}
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
                  <span title={message.external_id}>{shortId(message.external_id)}</span>
                ) : (
                  '—'
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={5}
              className="h-24 text-center text-muted-foreground"
            >
              Сообщений нет
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
