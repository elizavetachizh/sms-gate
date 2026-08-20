import type { MessageRead } from "@/shared/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { MessageStatusBadge } from "./MessageStatusBadge";

interface MailingMessagesTableProps {
  messages: MessageRead[];
  embedded?: boolean;
}

export function MailingMessagesTable({
  messages,
  embedded = false,
}: MailingMessagesTableProps) {
  return (
    <Table className={embedded ? "text-xs" : undefined}>
      <TableHeader>
        <TableRow>
          <TableHead>Номер</TableHead>
          <TableHead>Текст</TableHead>
          <TableHead>Статус</TableHead>
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
                className={
                  embedded ? "max-w-[240px] truncate" : "max-w-xs truncate"
                }
              >
                {message.text}
              </TableCell>
              <TableCell>
                <MessageStatusBadge status={message.status} />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={3}
              className="h-24 text-center text-muted-foreground"
            >
              Сообщений нет
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
