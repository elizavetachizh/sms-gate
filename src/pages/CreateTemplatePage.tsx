import { TemplateForm } from '@/features/templates/components/TemplateForm'

export function CreateTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Новый шаблон</h1>
        <p className="text-sm text-muted-foreground">
          Сохраните текст SMS для повторного использования
        </p>
      </div>

      <TemplateForm mode="create" />
    </div>
  )
}
