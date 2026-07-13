const CONFLICT_DETAIL_MESSAGES: Record<string, string> = {
  'Mailing can be updated only in created status':
    'Рассылку можно редактировать только в статусе «Создана»',
  'Mailing can be deleted only in created status':
    'Рассылку можно удалить только в статусе «Создана»',
  'Message can be modified only in created status':
    'Сообщение можно изменить только в статусе «Создано»',
}

export function localizeConflictDetail(detail: string): string {
  return CONFLICT_DETAIL_MESSAGES[detail] ?? detail
}
