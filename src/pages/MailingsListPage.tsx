import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { MailingsTable } from '@/features/mailings/components/MailingsTable'
import { useDeleteMailing } from '@/features/mailings/hooks/useDeleteMailing'
import { useMailingsList } from '@/features/mailings/hooks/useMailingsList'
import type { MailingRead, MailingStatus } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const routeApi = getRouteApi('/mailings')

const STATUS_OPTIONS: { value: 'all' | MailingStatus; label: string }[] = [
  { value: 'all', label: 'Все статусы' },
  { value: 'created', label: 'Создана' },
  { value: 'queued', label: 'В очереди' },
  { value: 'submitted', label: 'Отправлена' },
]

export function MailingsListPage() {
  const navigate = useNavigate({ from: '/mailings' })
  const { status, limit, offset } = routeApi.useSearch()
  const listParams = { status, limit, offset }

  const { data, isLoading, isError, error, refetch } = useMailingsList(listParams)
  const deleteMailing = useDeleteMailing()

  const statusFilter = status ?? 'all'
  const total = data?.total ?? 0
  const from = total === 0 ? 0 : offset + 1
  const to = Math.min(offset + limit, total)
  const hasPrev = offset > 0
  const hasNext = data ? offset + limit < data.total : false

  function updateSearch(next: {
    status?: MailingStatus | undefined
    offset?: number
  }) {
    navigate({
      search: (prev) => ({
        ...prev,
        ...next,
        offset: next.offset ?? 0,
      }),
    })
  }

  function handleStatusChange(value: string) {
    updateSearch({
      status: value === 'all' ? undefined : (value as MailingStatus),
      offset: 0,
    })
  }

  function handleDelete(mailing: MailingRead) {
    const confirmed = window.confirm(
      `Удалить рассылку ${mailing.id.slice(0, 8)}… (${mailing.messages.length} SMS)?`,
    )
    if (!confirmed) return
    deleteMailing.mutate(mailing.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Рассылки</h1>
          <p className="text-sm text-muted-foreground">
            Список SMS-рассылок с фильтрацией и пагинацией
          </p>
        </div>
        <Button asChild>
          <Link to="/mailings/new">
            <PlusIcon />
            Создать
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Статус</span>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data && (
          <p className="text-sm text-muted-foreground">
            Показано {from}–{to} из {total}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3 rounded-lg border p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Не удалось загрузить рассылки
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Повторить
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && (
        <div className="rounded-lg border bg-card">
          <MailingsTable
            mailings={data.items}
            onDelete={handleDelete}
            isDeleting={deleteMailing.isPending}
          />
        </div>
      )}

      {!isLoading && !isError && data && total > 0 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            onClick={() => updateSearch({ offset: Math.max(0, offset - limit) })}
          >
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() => updateSearch({ offset: offset + limit })}
          >
            Далее
          </Button>
        </div>
      )}
    </div>
  )
}
