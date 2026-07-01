export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

export function getPaginationMeta(total: number, limit: number, offset: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1)
  const currentPage = Math.min(totalPages, Math.floor(offset / limit) + 1)
  const from = total === 0 ? 0 : offset + 1
  const to = Math.min(offset + limit, total)

  return { totalPages, currentPage, from, to }
}

export function getVisiblePages(
  currentPage: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages])

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page)
    }
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | 'ellipsis')[] = []

  for (let index = 0; index < sorted.length; index += 1) {
    const page = sorted[index]
    const prevPage = sorted[index - 1]

    if (index > 0 && page - prevPage > 1) {
      result.push('ellipsis')
    }

    result.push(page)
  }

  return result
}
