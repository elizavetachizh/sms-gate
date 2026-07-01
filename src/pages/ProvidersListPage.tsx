import { useState } from 'react'
import { ProviderCard } from '@/features/providers/components/ProviderCard'
import { useProviders } from '@/features/providers/hooks/useProviders'
import { useUpdateProvider } from '@/features/providers/hooks/useUpdateProvider'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

export function ProvidersListPage() {
  const { data, isLoading, isError, error, refetch } = useProviders({ enabled_only: false })
  const updateProvider = useUpdateProvider()
  const [updatingCode, setUpdatingCode] = useState<string | null>(null)

  const providers = data?.items ?? []

  async function handleUpdate(
    ...args: Parameters<typeof updateProvider.mutateAsync>
  ) {
    const [{ code }] = args
    setUpdatingCode(code)

    try {
      return await updateProvider.mutateAsync(...args)
    } finally {
      setUpdatingCode(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Провайдеры</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Каталог SMS-шлюзов. Выключение провайдера не отменяет уже созданные
          рассылки и не блокирует отправку сообщений, уже поставленных в очередь.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Не удалось загрузить провайдеров
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Повторить
          </Button>
        </div>
      )}

      {!isLoading && !isError && providers.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">Провайдеры не найдены</p>
        </div>
      )}

      {!isLoading && !isError && providers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.code}
              provider={provider}
              isUpdating={updateProvider.isPending}
              updatingCode={updatingCode}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
