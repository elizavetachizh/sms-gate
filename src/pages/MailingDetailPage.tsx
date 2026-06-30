import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  Loader2Icon,
  RefreshCwIcon,
  SendIcon,
  Trash2Icon,
} from 'lucide-react'
import { MailingMessagesTable } from '@/features/mailings/components/MailingMessagesTable'
import { MailingStatusBadge } from '@/features/mailings/components/MailingStatusBadge'
import { useDeleteMailing } from '@/features/mailings/hooks/useDeleteMailing'
import { useMailingDetail } from '@/features/mailings/hooks/useMailingDetail'
import { useSendMailing } from '@/features/mailings/hooks/useSendMailing'
import { hasPendingMessages } from '@/features/mailings/lib/message-status'
import { defaultMailingsSearch } from '@/features/mailings/search'
import { isNotFoundError } from '@/shared/api'
import { formatDateTime, shortId } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

export function MailingDetailPage() {
  const { mailingId } = useParams({ from: '/mailings/$mailingId' })
  const navigate = useNavigate()

  const { data: mailing, isLoading, isError, error, refetch, isFetching } =
    useMailingDetail(mailingId)
  const sendMailing = useSendMailing(mailingId)
  const deleteMailing = useDeleteMailing()

  const isPolling =
    Boolean(mailing) &&
    mailing!.status !== 'created' &&
    hasPendingMessages(mailing!.messages)

  const canSend = mailing?.status === 'created'

  async function handleSend() {
    try {
      await sendMailing.mutateAsync()
    } catch {
      // error shown via sendMailing.isError
    }
  }

  function handleDelete() {
    if (!mailing) return

    const confirmed = window.confirm(
      `Удалить рассылку ${shortId(mailing.id)}… (${mailing.messages.length} SMS)?`,
    )
    if (!confirmed) return

    deleteMailing.mutate(mailing.id, {
      onSuccess: () => {
        navigate({ to: '/mailings', search: defaultMailingsSearch })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    const isNotFound = isNotFoundError(error)

    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/mailings" search={defaultMailingsSearch}>
            <ArrowLeftIcon />
            К списку
          </Link>
        </Button>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            {isNotFound ? 'Рассылка не найдена' : 'Не удалось загрузить рассылку'}
          </p>
          {!isNotFound && (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Неизвестная ошибка'}
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                Повторить
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!mailing) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
            <Link to="/mailings" search={defaultMailingsSearch}>
              <ArrowLeftIcon />
              К списку
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            Рассылка{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-base font-normal">
              {shortId(mailing.id)}
            </code>
          </h1>
          <p className="text-sm text-muted-foreground">
            {mailing.messages.length}{' '}
            {mailing.messages.length === 1 ? 'сообщение' : 'сообщений'}
            {isPolling && ' · обновление статусов…'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />}
            Обновить
          </Button>

          {canSend && (
            <Button
              size="sm"
              disabled={sendMailing.isPending}
              onClick={handleSend}
            >
              {sendMailing.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <SendIcon />
              )}
              Отправить
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={deleteMailing.isPending}
            onClick={handleDelete}
          >
            <Trash2Icon className="text-destructive" />
            Удалить
          </Button>
        </div>
      </div>

      {sendMailing.isError && (
        <p className="text-sm text-destructive">
          {sendMailing.error instanceof Error
            ? sendMailing.error.message
            : 'Не удалось отправить рассылку'}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Информация</CardTitle>
          <CardDescription>Метаданные рассылки</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Статус</dt>
              <dd>
                <MailingStatusBadge status={mailing.status} />
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Создана</dt>
              <dd className="text-sm">{formatDateTime(mailing.created_at)}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Обновлена</dt>
              <dd className="text-sm">{formatDateTime(mailing.updated_at)}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Автор</dt>
              <dd className="text-sm" title={mailing.created_by.email}>
                {mailing.created_by.email}
              </dd>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-sm text-muted-foreground">ID</dt>
              <dd className="font-mono text-sm">{mailing.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сообщения</CardTitle>
          <CardDescription>
            {canSend
              ? 'Рассылка ещё не отправлена — нажмите «Отправить» для постановки в очередь.'
              : 'Статусы обновляются автоматически после отправки.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <MailingMessagesTable messages={mailing.messages} />
        </CardContent>
      </Card>
    </div>
  )
}
