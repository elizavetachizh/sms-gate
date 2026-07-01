import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  getPaginationMeta,
  getVisiblePages,
} from '@/shared/lib/pagination'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

interface PaginationProps {
  total: number
  limit: number
  offset: number
  onOffsetChange: (offset: number) => void
  onLimitChange: (limit: number) => void
  pageSizeOptions?: readonly number[]
  className?: string
}

export function Pagination({
  total,
  limit,
  offset,
  onOffsetChange,
  onLimitChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: PaginationProps) {
  const { totalPages, currentPage, from, to } = getPaginationMeta(total, limit, offset)
  const visiblePages = getVisiblePages(currentPage, totalPages)

  const hasPrev = offset > 0
  const hasNext = offset + limit < total

  function goToPage(page: number) {
    onOffsetChange((page - 1) * limit)
  }

  function handleLimitChange(value: string) {
    onLimitChange(Number(value))
  }

  if (total === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm text-muted-foreground">
          Показано {from}–{to} из {total}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            На странице
          </span>
          <Select value={String(limit)} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[72px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!hasPrev}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          aria-label="Предыдущая страница"
        >
          <ChevronLeftIcon />
        </Button>

        {visiblePages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex size-8 items-center justify-center text-sm text-muted-foreground"
              aria-hidden
            >
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="icon"
              className="size-8 tabular-nums"
              onClick={() => goToPage(page)}
              aria-label={`Страница ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!hasNext}
          onClick={() => onOffsetChange(offset + limit)}
          aria-label="Следующая страница"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
