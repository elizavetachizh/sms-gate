import '@/test/mocks/shared-api'
import { act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { templatesApi } from '@/test/mocks/shared-api'
import {
  createHookWrapper,
  createTestQueryClient,
  renderHook,
  waitFor,
} from '@/test/utils/render-hook'
import { templateFixture, templatesPageFixture } from '@/test/fixtures'
import { templateKeys } from '../api/templates.keys'
import { useTemplatesList } from './useTemplatesList'
import { useCreateTemplate } from './useCreateTemplate'
import { useDeleteTemplate } from './useDeleteTemplate'

describe('useTemplatesList', () => {
  it('loads templates page', async () => {
    const params = { limit: 20, offset: 0 }
    const page = templatesPageFixture()
    vi.mocked(templatesApi.list).mockResolvedValue(page)

    const { result } = renderHook(() => useTemplatesList(params), {
      wrapper: createHookWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(templatesApi.list).toHaveBeenCalledWith(params)
    expect(result.current.data).toEqual(page)
  })
})

describe('useCreateTemplate', () => {
  it('creates template and updates cache', async () => {
    const queryClient = createTestQueryClient()
    const payload = { name: 'Welcome', text: 'Hello' }
    const template = templateFixture(payload)
    vi.mocked(templatesApi.create).mockResolvedValue(template)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData')

    const { result } = renderHook(() => useCreateTemplate(), {
      wrapper: createHookWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync(payload)
    })

    expect(templatesApi.create).toHaveBeenCalledWith(payload)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: templateKeys.lists() })
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      templateKeys.detail(template.id),
      template,
    )
  })
})

describe('useDeleteTemplate', () => {
  it('deletes template and invalidates list', async () => {
    const queryClient = createTestQueryClient()
    const templateId = '880e8400-e29b-41d4-a716-446655440003'
    vi.mocked(templatesApi.delete).mockResolvedValue(undefined)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteTemplate(), {
      wrapper: createHookWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync(templateId)
    })

    expect(templatesApi.delete).toHaveBeenCalledWith(templateId)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: templateKeys.lists() })
  })
})
