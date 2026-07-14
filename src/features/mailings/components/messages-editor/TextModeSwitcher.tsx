import { TEXT_MODE_OPTIONS } from '@/features/mailings/components/messages-editor/constants'
import type { MailingTextMode } from '@/features/mailings/schemas/mailing.schema'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'

interface TextModeSwitcherProps {
  textMode: MailingTextMode
  onChange: (mode: MailingTextMode) => void
}

export function TextModeSwitcher({ textMode, onChange }: TextModeSwitcherProps) {
  const activeOption = TEXT_MODE_OPTIONS.find((option) => option.value === textMode)

  return (
    <div className="space-y-3">
      <Label>Текст сообщений</Label>
      <div className="flex flex-wrap gap-2">
        {TEXT_MODE_OPTIONS.map((option) => {
          const Icon = option.icon

          return (
            <Button
              key={option.value}
              type="button"
              size="icon"
              variant={textMode === option.value ? 'default' : 'outline'}
              aria-label={option.label}
              title={option.label}
              aria-pressed={textMode === option.value}
              onClick={() => onChange(option.value)}
            >
              <Icon />
            </Button>
          )
        })}
      </div>
      {activeOption && (
        <p className="text-sm text-muted-foreground">{activeOption.description}</p>
      )}
    </div>
  )
}
