import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { TemplateForm } from '@/features/templates/components/TemplateForm'
import { useTemplateDetail } from '@/features/templates/hooks/useTemplateDetail'
import { defaultTemplatesSearch } from '@/features/templates/search'
import { isNotFoundError } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

export function EditTemplatePage() {
  const { templateId } = useParams({ from: '/_authenticated/templates/$templateId/edit' })
  const { data: template, isLoading, isError, error, refetch } =
    useTemplateDetail(templateId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    const isNotFound = isNotFoundError(error)

    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/templates" search={defaultTemplatesSearch}>
            <ArrowLeftIcon />
            К списку
          </Link>
        </Button>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            {isNotFound ? 'Шаблон не найден' : 'Не удалось загрузить шаблон'}
          </p>
          {!isNotFound && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Повторить
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!template) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Редактирование: {template.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Измените название или текст шаблона
        </p>
      </div>

      <TemplateForm
        mode="edit"
        templateId={templateId}
        initialValues={{ name: template.name, text: template.text }}
      />
    </div>
  )
}
