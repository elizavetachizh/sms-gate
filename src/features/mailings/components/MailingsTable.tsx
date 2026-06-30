import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { EyeIcon, Trash2Icon } from 'lucide-react'
import type { MailingRead } from '@/shared/api'
import { formatDateTime, shortId } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { MailingStatusBadge } from './MailingStatusBadge'

interface MailingsTableProps {
  mailings: MailingRead[]
  onDelete: (mailing: MailingRead) => void
  isDeleting: boolean
}

const columns: ColumnDef<MailingRead>[] = [
  {
    accessorKey: 'created_at',
    header: 'Создана',
    cell: ({ row }) => formatDateTime(row.original.created_at),
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <MailingStatusBadge status={row.original.status} />,
  },
  {
    id: 'messages_count',
    header: 'SMS',
    cell: ({ row }) => row.original.messages.length,
  },
  {
    id: 'author',
    header: 'Автор',
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate" title={row.original.created_by.email}>
        {row.original.created_by.email}
      </span>
    ),
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
        {shortId(row.original.id)}
      </code>
    ),
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Действия</span>,
    cell: ({ row, table }) => {
      const { onDelete, isDeleting } = table.options.meta as MailingsTableMeta

      return (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link
              to="/mailings/$mailingId"
              params={{ mailingId: row.original.id }}
              aria-label="Открыть рассылку"
            >
              <EyeIcon />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            onClick={() => onDelete(row.original)}
            aria-label="Удалить рассылку"
          >
            <Trash2Icon className="text-destructive" />
          </Button>
        </div>
      )
    },
  },
]

interface MailingsTableMeta {
  onDelete: (mailing: MailingRead) => void
  isDeleting: boolean
}

export function MailingsTable({
  mailings,
  onDelete,
  isDeleting,
}: MailingsTableProps) {
  const table = useReactTable({
    data: mailings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: { onDelete, isDeleting } satisfies MailingsTableMeta,
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
              Рассылок не найдено
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
