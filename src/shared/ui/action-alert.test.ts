import { describe, expect, it } from 'vitest'
import { getActionAlertContent } from './action-alert'

describe('getActionAlertContent', () => {
  it('returns success content for created message', () => {
    expect(getActionAlertContent('created', { entity: 'message' })).toMatchObject({
      variant: 'success',
      title: 'Создано',
      description: 'Сообщение добавлено',
    })
  })

  it('returns success content for updated mailing', () => {
    expect(getActionAlertContent('updated', { entity: 'mailing' })).toMatchObject({
      variant: 'success',
      title: 'Сохранено',
      description: 'Рассылка обновлена',
    })
  })

  it('returns success content for deleted template', () => {
    expect(getActionAlertContent('deleted', { entity: 'template' })).toMatchObject({
      variant: 'success',
      title: 'Удалено',
      description: 'Шаблон удалён',
    })
  })

  it('returns success content for created user', () => {
    expect(getActionAlertContent('created', { entity: 'user' })).toMatchObject({
      variant: 'success',
      title: 'Создано',
      description: 'Пользователь создан',
    })
  })

  it('returns error content with custom message', () => {
    expect(
      getActionAlertContent('error', { message: 'Конфликт статуса' }),
    ).toMatchObject({
      variant: 'destructive',
      title: 'Ошибка',
      description: 'Конфликт статуса',
    })
  })
})
