import {
  AlertCircleIcon,
  CheckCircle2Icon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  type LucideIcon,
} from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import { Alert, AlertDescription, AlertTitle, alertVariants } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'

export type ActionAlertType = 'created' | 'updated' | 'deleted' | 'error'

export type ActionAlertEntity = 'message' | 'mailing' | 'template' | 'provider'

const ENTITY_MESSAGES: Record<
  ActionAlertEntity,
  Record<Exclude<ActionAlertType, 'error'>, string>
> = {
  message: {
    created: 'Сообщение добавлено',
    updated: 'Сообщение обновлено',
    deleted: 'Сообщение удалено',
  },
  mailing: {
    created: 'Рассылка создана',
    updated: 'Рассылка обновлена',
    deleted: 'Рассылка удалена',
  },
  template: {
    created: 'Шаблон создан',
    updated: 'Шаблон обновлён',
    deleted: 'Шаблон удалён',
  },
  provider: {
    created: 'Провайдер добавлен',
    updated: 'Провайдер обновлён',
    deleted: 'Провайдер удалён',
  },
}

const ACTION_TITLES: Record<ActionAlertType, string> = {
  created: 'Создано',
  updated: 'Сохранено',
  deleted: 'Удалено',
  error: 'Ошибка',
}

const ACTION_VARIANTS: Record<
  ActionAlertType,
  NonNullable<VariantProps<typeof alertVariants>['variant']>
> = {
  created: 'success',
  updated: 'success',
  deleted: 'success',
  error: 'destructive',
}

const ACTION_ICONS: Record<ActionAlertType, LucideIcon> = {
  created: CheckCircle2Icon,
  updated: PencilIcon,
  deleted: Trash2Icon,
  error: AlertCircleIcon,
}

export interface ActionAlertContent {
  variant: NonNullable<VariantProps<typeof alertVariants>['variant']>
  title: string
  description: string
  icon: LucideIcon
}

export function getActionAlertContent(
  action: ActionAlertType,
  options?: {
    entity?: ActionAlertEntity
    message?: string
  },
): ActionAlertContent {
  const entity = options?.entity ?? 'message'

  if (action === 'error') {
    return {
      variant: 'destructive',
      title: ACTION_TITLES.error,
      description: options?.message ?? 'Не удалось выполнить операцию',
      icon: ACTION_ICONS.error,
    }
  }

  return {
    variant: ACTION_VARIANTS[action] ?? 'default',
    title: ACTION_TITLES[action],
    description: ENTITY_MESSAGES[entity][action],
    icon: ACTION_ICONS[action],
  }
}

interface ActionAlertProps {
  action: ActionAlertType
  entity?: ActionAlertEntity
  message?: string
  onDismiss?: () => void
  className?: string
}

export function ActionAlert({
  action,
  entity,
  message,
  onDismiss,
  className,
}: ActionAlertProps) {
  const content = getActionAlertContent(action, { entity, message })
  const Icon = content.icon

  return (
    <Alert variant={content.variant} className={cn(onDismiss && 'pr-12', className)}>
      <Icon className="size-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        <AlertTitle>{content.title}</AlertTitle>
        <AlertDescription>{content.description}</AlertDescription>
      </div>
      {onDismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-2 right-2 size-8',
            content.variant === 'destructive'
              ? 'text-red-700 hover:bg-red-100 hover:text-red-900 dark:text-red-300 dark:hover:bg-red-950 dark:hover:text-red-100'
              : 'text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950 dark:hover:text-emerald-100',
          )}
          onClick={onDismiss}
          aria-label="Закрыть"
        >
          <XIcon className="size-4" />
        </Button>
      )}
    </Alert>
  )
}
