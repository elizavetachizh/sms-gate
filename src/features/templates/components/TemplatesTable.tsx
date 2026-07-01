import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { PencilIcon, Trash2Icon } from 'lucide-react'
import type { MailingTemplateRead } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

interface TemplatesTableProps {
  templates: MailingTemplateRead[]
  onDelete: (template: MailingTemplateRead) => void
  isDeleting: boolean
}

const columns: ColumnDef<MailingTemplateRead>[] = [
  {
    accessorKey: 'name',
    header: 'Название',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: 'text',
    header: 'Текст',
    cell: ({ row }) => (
      <span className="block max-w-md truncate" title={row.original.text}>
        {row.original.text}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Создан',
    cell: ({ row }) => formatDateTime(row.original.created_at),
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Действия</span>,
    cell: ({ row, table }) => {
      const { onDelete, isDeleting } = table.options.meta as TemplatesTableMeta

      return (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link
              to="/templates/$templateId/edit"
              params={{ templateId: row.original.id }}
              aria-label="Редактировать шаблон"
            >
              <PencilIcon />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            onClick={() => onDelete(row.original)}
            aria-label="Удалить шаблон"
          >
            <Trash2Icon className="text-destructive" />
          </Button>
        </div>
      )
    },
  },
]

interface TemplatesTableMeta {
  onDelete: (template: MailingTemplateRead) => void
  isDeleting: boolean
}

export function TemplatesTable({
  templates,
  onDelete,
  isDeleting,
}: TemplatesTableProps) {
  const table = useReactTable({
    data: templates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: { onDelete, isDeleting } satisfies TemplatesTableMeta,
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
              Шаблонов не найдено
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
