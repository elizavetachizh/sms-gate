import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { TemplatesTable } from '@/features/templates/components/TemplatesTable'
import { useDeleteTemplate } from '@/features/templates/hooks/useDeleteTemplate'
import { useTemplatesList } from '@/features/templates/hooks/useTemplatesList'
import type { MailingTemplateRead } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

const routeApi = getRouteApi('/templates')

export function TemplatesListPage() {
  const navigate = useNavigate({ from: '/templates' })
  const { limit, offset } = routeApi.useSearch()
  const listParams = { limit, offset }

  const { data, isLoading, isError, error, refetch } = useTemplatesList(listParams)
  const deleteTemplate = useDeleteTemplate()

  const total = data?.total ?? 0
  const from = total === 0 ? 0 : offset + 1
  const to = Math.min(offset + limit, total)
  const hasPrev = offset > 0
  const hasNext = data ? offset + limit < data.total : false

  function updateOffset(nextOffset: number) {
    navigate({
      search: (prev) => ({
        ...prev,
        offset: nextOffset,
      }),
    })
  }

  function handleDelete(template: MailingTemplateRead) {
    const confirmed = window.confirm(`Удалить шаблон «${template.name}»?`)
    if (!confirmed) return
    deleteTemplate.mutate(template.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Шаблоны</h1>
          <p className="text-sm text-muted-foreground">
            Сохранённые тексты SMS для быстрого создания рассылок
          </p>
        </div>
        <Button asChild>
          <Link to="/templates/new">
            <PlusIcon />
            Создать
          </Link>
        </Button>
      </div>

      {data && (
        <p className="text-sm text-muted-foreground">
          Показано {from}–{to} из {total}
        </p>
      )}

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
            Не удалось загрузить шаблоны
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
          <TemplatesTable
            templates={data.items}
            onDelete={handleDelete}
            isDeleting={deleteTemplate.isPending}
          />
        </div>
      )}

      {!isLoading && !isError && data && total > 0 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            onClick={() => updateOffset(Math.max(0, offset - limit))}
          >
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() => updateOffset(offset + limit)}
          >
            Далее
          </Button>
        </div>
      )}
    </div>
  )
}
