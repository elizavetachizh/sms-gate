import { Fragment, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  Trash2Icon,
} from "lucide-react";
import type { MailingRead } from "@/shared/api";
import { cn, formatDateTime } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { buttonVariants } from "@/shared/ui/button-variants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { MailingMessagesTable } from "./MailingMessagesTable";
import { MailingStatusBadge } from "./MailingStatusBadge";

interface MailingsTableProps {
  mailings: MailingRead[];
  onDelete: (mailing: MailingRead) => void;
  isDeleting: boolean;
}

interface MailingsTableMeta {
  onDelete: (mailing: MailingRead) => void;
  isDeleting: boolean;
  expandedIds: Set<string>;
  toggleExpanded: (mailingId: string) => void;
}

const columns: ColumnDef<MailingRead>[] = [
  {
    id: "expand",
    header: () => <span className="sr-only">Сообщения</span>,
    cell: ({ row, table }) => {
      const { expandedIds, toggleExpanded } = table.options
        .meta as MailingsTableMeta;
      const count = row.original.messages.length;

      if (count === 0) {
        return <span className="inline-block size-8" aria-hidden />;
      }

      const isExpanded = expandedIds.has(row.original.id);

      return (
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => toggleExpanded(row.original.id)}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded ? "Свернуть сообщения" : "Развернуть сообщения"
          }
        >
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Наименование",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "created_at",
    header: "Создана",
    cell: ({ row }) => formatDateTime(row.original.created_at),
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => <MailingStatusBadge status={row.original.status} />,
  },
  {
    id: "messages_count",
    header: "SMS",
    cell: ({ row, table }) => {
      const { expandedIds, toggleExpanded } = table.options
        .meta as MailingsTableMeta;
      const count = row.original.messages.length;

      if (count === 0) return 0;

      const isExpanded = expandedIds.has(row.original.id);

      return (
        <Button
          variant="link"
          className="h-auto p-0 font-normal tabular-nums"
          onClick={() => toggleExpanded(row.original.id)}
          aria-expanded={isExpanded}
        >
          {count}
        </Button>
      );
    },
  },
  {
    id: "author",
    header: "Автор",
    cell: ({ row }) => (
      <span
        className="max-w-[200px] truncate"
        title={row.original.created_by.email}
      >
        {row.original.created_by.email}
      </span>
    ),
  },

  {
    id: "actions",
    header: () => <span className="sr-only">Действия</span>,
    cell: ({ row, table }) => {
      const { onDelete, isDeleting } = table.options.meta as MailingsTableMeta;

      return (
        <div className="flex items-center justify-end gap-1">
          <Link
            from="/mailings"
            to="/mailings/$mailingId"
            params={{ mailingId: row.original.id }}
            aria-label="Открыть рассылку"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <EyeIcon />
          </Link>

          <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting || row.original.status !== "created"}
            onClick={() => onDelete(row.original)}
            aria-label="Удалить рассылку"
          >
            <Trash2Icon className="text-destructive" />
          </Button>
        </div>
      );
    },
  },
];

export function MailingsTable({
  mailings,
  onDelete,
  isDeleting,
}: MailingsTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  function toggleExpanded(mailingId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(mailingId)) {
        next.delete(mailingId);
      } else {
        next.add(mailingId);
      }
      return next;
    });
  }

  const table = useReactTable({
    data: mailings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onDelete,
      isDeleting,
      expandedIds,
      toggleExpanded,
    } satisfies MailingsTableMeta,
  });

  const columnCount = table.getAllColumns().length;

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            const isExpanded = expandedIds.has(row.original.id);

            return (
              <Fragment key={row.id}>
                <TableRow>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {isExpanded && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={columnCount}
                      className="p-0 whitespace-normal"
                    >
                      <div className="border-t bg-muted/20 px-4 py-3">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Сообщения ({row.original.messages.length})
                        </p>
                        <div className="overflow-hidden rounded-md border bg-card">
                          <MailingMessagesTable
                            messages={row.original.messages}
                            embedded
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })
        ) : (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="h-24 text-center text-muted-foreground"
            >
              Рассылок не найдено
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
