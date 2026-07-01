import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm, useWatch } from 'react-hook-form'
import { ArrowLeftIcon } from 'lucide-react'
import {
  useCreateTemplate,
  isValidationError,
} from '@/features/templates/hooks/useCreateTemplate'
import { useUpdateTemplate } from '@/features/templates/hooks/useUpdateTemplate'
import {
  defaultTemplateFormValues,
  SMS_TEXT_MAX_LENGTH,
  templateFormSchema,
  type TemplateFormValues,
} from '@/features/templates/schemas/template.schema'
import { defaultTemplatesSearch } from '@/features/templates/search'
import {
  applyValidationErrors,
  mapValidationErrors,
} from '@/shared/api/map-validation-errors'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

interface TemplateFormProps {
  mode: 'create' | 'edit'
  templateId?: string
  initialValues?: TemplateFormValues
}

export function TemplateForm({ mode, templateId, initialValues }: TemplateFormProps) {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate(templateId ?? '')

  const isPending =
    mode === 'create' ? createTemplate.isPending : updateTemplate.isPending

  const {
    register,
    handleSubmit,
    setError,
    control,
    reset,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: initialValues ?? defaultTemplateFormValues,
  })

  useEffect(() => {
    if (initialValues) {
      reset(initialValues)
    }
  }, [initialValues, reset])

  const text = useWatch({ control, name: 'text' }) ?? ''
  const textLength = text.length
  const isOverLimit = textLength > SMS_TEXT_MAX_LENGTH

  async function onSubmit(values: TemplateFormValues) {
    setSubmitError(null)

    try {
      if (mode === 'create') {
        await createTemplate.mutateAsync(values)
        navigate({ to: '/templates', search: defaultTemplatesSearch })
        return
      }

      if (!templateId) return

      await updateTemplate.mutateAsync(values)
      navigate({ to: '/templates', search: defaultTemplatesSearch })
    } catch (error) {
      if (isValidationError(error)) {
        applyValidationErrors(mapValidationErrors(error.details), setError)
        return
      }

      setSubmitError(
        error instanceof Error ? error.message : 'Не удалось сохранить шаблон',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? 'Новый шаблон' : 'Редактирование шаблона'}
          </CardTitle>
          <CardDescription>
            Сохранённый текст SMS для повторного использования при создании рассылок.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              placeholder="Приветствие"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name?.message && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="text">Текст SMS</Label>
              <span
                className={cn(
                  'text-xs tabular-nums',
                  isOverLimit ? 'font-medium text-destructive' : 'text-muted-foreground',
                )}
                aria-live="polite"
              >
                {textLength}/{SMS_TEXT_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              id="text"
              placeholder="Здравствуйте! Ваш заказ готов."
              rows={5}
              aria-invalid={Boolean(errors.text)}
              {...register('text')}
            />
            {errors.text?.message && (
              <p className="text-sm text-destructive">{errors.text.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" asChild>
            <Link to="/templates" search={defaultTemplatesSearch}>
              <ArrowLeftIcon />
              Назад к списку
            </Link>
          </Button>

          <Button type="submit" disabled={isPending}>
            {isPending
              ? 'Сохранение…'
              : mode === 'create'
                ? 'Создать шаблон'
                : 'Сохранить'}
          </Button>
        </CardFooter>
      </Card>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}
    </form>
  )
}
