import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { PencilIcon } from "lucide-react";
import type { UserRead } from "@/shared/api";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { USER_ROLE_LABELS } from "../schemas/user.schema";

interface UsersTableProps {
  users: UserRead[];
  onEdit: (user: UserRead) => void;
}

const columns: ColumnDef<UserRead>[] = [
  {
    accessorKey: "name",
    header: "Имя",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name.trim() || "—"}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Роль",
    cell: ({ row }) => (
      <Badge variant={row.original.role === "admin" ? "default" : "secondary"}>
        {USER_ROLE_LABELS[row.original.role]}
      </Badge>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Статус",
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant="success">Активен</Badge>
      ) : (
        <Badge variant="muted">Неактивен</Badge>
      ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Действия</span>,
    cell: ({ row, table }) => {
      const { onEdit } = table.options.meta as UsersTableMeta;

      return (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            aria-label="Изменить пользователя"
          >
            <PencilIcon />
          </Button>
        </div>
      );
    },
  },
];

interface UsersTableMeta {
  onEdit: (user: UserRead) => void;
}

export function UsersTable({ users, onEdit }: UsersTableProps) {
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: { onEdit } satisfies UsersTableMeta,
  });

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
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              Пользователи не найдены
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
