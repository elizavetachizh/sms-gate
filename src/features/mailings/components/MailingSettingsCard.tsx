import { useEffect, useState } from 'react'
import { Loader2Icon, ReplaceIcon, Trash2Icon } from 'lucide-react'
import { ReplaceMailingMessagesDialog } from '@/features/mailings/components/ReplaceMailingMessagesDialog'
import { useUpdateMailing } from '@/features/mailings/hooks/useUpdateMailing'
import {
  getStoredMailingProviderCode,
  setStoredMailingProviderCode,
} from '@/features/mailings/lib/mailing-provider-storage'
import { localizeMailingApiDetail } from '@/features/mailings/lib/mailing-api-errors'
import { useProviders } from '@/features/providers/hooks/useProviders'
import { isValidationError, type MessageRead } from '@/shared/api'
import { getMutationErrorMessage } from '@/shared/lib/mutation-error'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

interface MailingSettingsCardProps {
  mailingId: string
  messageCount: number
  messages: MessageRead[]
  onUpdated: () => void
  onError: (message: string) => void
}

export function MailingSettingsCard({
  mailingId,
  messageCount,
  messages,
  onUpdated,
  onError,
}: MailingSettingsCardProps) {
  const [providerCode, setProviderCode] = useState('')
  const [savedProviderCode, setSavedProviderCode] = useState('')
  const [providerError, setProviderError] = useState<string | null>(null)
  const [isReplaceOpen, setIsReplaceOpen] = useState(false)
  const [isClearOpen, setIsClearOpen] = useState(false)

  const { data: providersData, isLoading: isProvidersLoading, isError: isProvidersError } =
    useProviders()
  const updateMailing = useUpdateMailing(mailingId)

  const providers = providersData?.items ?? []
  const hasProviderChange = providerCode !== savedProviderCode && providerCode !== ''

  useEffect(() => {
    if (!providers.length) return

    const stored = getStoredMailingProviderCode(mailingId)
    const initial =
      stored && providers.some((provider) => provider.code === stored)
        ? stored
        : providers[0].code

    setProviderCode(initial)
    setSavedProviderCode(initial)
  }, [mailingId, providers])

  async function handleSaveProvider() {
    if (!providerCode || !hasProviderChange) return

    setProviderError(null)

    try {
      await updateMailing.updateProvider(providerCode)
      setStoredMailingProviderCode(mailingId, providerCode)
      setSavedProviderCode(providerCode)
      onUpdated()
    } catch (error) {
      if (isValidationError(error)) {
        setProviderError(
          error.detailMessage
            ? localizeMailingApiDetail(error.detailMessage)
            : 'Не удалось сохранить провайдера',
        )
        return
      }

      onError(getMutationErrorMessage(error, 'Не удалось сохранить провайдера'))
    }
  }

  async function handleClearMessages() {
    if (!savedProviderCode) return

    try {
      await updateMailing.clearMessages(savedProviderCode)
      setIsClearOpen(false)
      onUpdated()
    } catch (error) {
      setIsClearOpen(false)
      onError(getMutationErrorMessage(error, 'Не удалось очистить получателей'))
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Настройки</CardTitle>
          <CardDescription>
            Провайдер и массовые операции со списком получателей
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mailing-provider">Провайдер</Label>

            {isProvidersLoading && <Skeleton className="h-9 w-full max-w-xs" />}

            {isProvidersError && (
              <p className="text-sm text-destructive">
                Не удалось загрузить список провайдеров
              </p>
            )}

            {!isProvidersLoading && !isProvidersError && providers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Select value={providerCode} onValueChange={setProviderCode}>
                  <SelectTrigger id="mailing-provider" className="max-w-xs">
                    <SelectValue placeholder="Выберите провайдера" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.code} value={provider.code}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  size="sm"
                  disabled={!hasProviderChange || updateMailing.isPending}
                  onClick={handleSaveProvider}
                >
                  {updateMailing.isPending ? (
                    <Loader2Icon className="animate-spin" />
                  ) : null}
                  Сохранить провайдера
                </Button>
              </div>
            )}

            {!isProvidersLoading && !isProvidersError && providers.length === 0 && (
              <p className="text-sm text-muted-foreground">Провайдеры не найдены</p>
            )}

            {providerError && (
              <p className="text-sm text-destructive">{providerError}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={updateMailing.isPending || !savedProviderCode}
              onClick={() => setIsReplaceOpen(true)}
            >
              <ReplaceIcon />
              Заменить список
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                updateMailing.isPending || messageCount === 0 || !savedProviderCode
              }
              onClick={() => setIsClearOpen(true)}
            >
              <Trash2Icon className="text-destructive" />
              Очистить получателей
            </Button>
          </div>
        </CardContent>
      </Card>

      <ReplaceMailingMessagesDialog
        mailingId={mailingId}
        providerCode={savedProviderCode}
        messages={messages}
        open={isReplaceOpen}
        onOpenChange={setIsReplaceOpen}
        onSuccess={onUpdated}
      />

      <ConfirmDialog
        open={isClearOpen}
        onOpenChange={(open) => {
          if (!updateMailing.isPending) {
            setIsClearOpen(open)
          }
        }}
        title="Очистить получателей?"
        description={
          <>
            Все {messageCount}{' '}
            {messageCount === 1 ? 'сообщение будет удалено' : 'сообщений будут удалены'}{' '}
            из рассылки. Это действие нельзя будет отменить.
          </>
        }
        confirmLabel="Очистить"
        onConfirm={handleClearMessages}
        isPending={updateMailing.isPending}
      />
    </>
  )
}
