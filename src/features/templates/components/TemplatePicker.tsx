import type { MailingTemplateRead } from '@/shared/api'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const NONE_VALUE = '__none__'

interface TemplatePickerProps {
  id?: string
  label?: string
  templates: MailingTemplateRead[]
  isLoading?: boolean
  isError?: boolean
  value: string | null
  onChange: (template: MailingTemplateRead | null) => void
  className?: string
}

export function TemplatePicker({
  id,
  label = 'Шаблон',
  templates,
  isLoading,
  isError,
  value,
  onChange,
  className,
}: TemplatePickerProps) {
  if (isLoading) {
    return (
      <div className={className}>
        {label && <Label className="mb-2 block">{label}</Label>}
        <Skeleton className="h-9 w-full max-w-xs" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className={className}>
        {label && <Label className="mb-2 block">{label}</Label>}
        <p className="text-sm text-destructive">Не удалось загрузить шаблоны</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} className="mb-2 block">
          {label}
        </Label>
      )}
      <Select
        value={value ?? NONE_VALUE}
        onValueChange={(selected) => {
          if (selected === NONE_VALUE) {
            onChange(null)
            return
          }
          const template = templates.find((item) => item.id === selected) ?? null
          onChange(template)
        }}
      >
        <SelectTrigger id={id} className="max-w-xs">
          <SelectValue placeholder="Выберите шаблон" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>Не выбран</SelectItem>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
