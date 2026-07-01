import { Link } from '@tanstack/react-router'
import { useMe } from '@/features/auth/hooks/useMe'
import { defaultMailingsSearch } from '@/features/mailings/search'
import { defaultProvidersSearch } from '@/features/providers/search'
import { defaultTemplatesSearch } from '@/features/templates/search'
import { cn, shortId } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

export function Header() {
  const { data: me, isLoading, isError } = useMe()

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/mailings" search={defaultMailingsSearch} className="text-lg font-semibold tracking-tight">
            SMS Gate
          </Link>
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/mailings"
                search={defaultMailingsSearch}
                className={cn('[&.active]:bg-accent')}
                activeProps={{ className: 'active' }}
              >
                Рассылки
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/templates"
                search={defaultTemplatesSearch}
                className={cn('[&.active]:bg-accent')}
                activeProps={{ className: 'active' }}
              >
                Шаблоны
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/providers"
                search={defaultProvidersSearch}
                className={cn('[&.active]:bg-accent')}
                activeProps={{ className: 'active' }}
              >
                Провайдеры
              </Link>
            </Button>
          </nav>
        </div>

        <div className="text-sm text-muted-foreground">
          {isLoading && <Skeleton className="h-4 w-32" />}
          {!isLoading && isError && 'API недоступен'}
          {!isLoading && !isError && me && (
            <span title={me.email}>{shortId(me.id)}@…</span>
          )}
        </div>
      </div>
    </header>
  )
}
