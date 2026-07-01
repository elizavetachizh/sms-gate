import '@/test/mocks/shared-api'
import { describe, expect, it, vi } from 'vitest'
import { act } from '@testing-library/react'
import { mailingsApi } from '@/test/mocks/shared-api'
import {
  createHookWrapper,
  createTestQueryClient,
  renderHook,
} from '@/test/utils/render-hook'
import { mailingKeys } from '../api/mailings.keys'
import { useDeleteMailing } from './useDeleteMailing'

describe('useDeleteMailing', () => {
  it('deletes mailing and invalidates list', async () => {
    const queryClient = createTestQueryClient()
    const mailingId = '660e8400-e29b-41d4-a716-446655440001'
    vi.mocked(mailingsApi.delete).mockResolvedValue(undefined)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteMailing(), {
      wrapper: createHookWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync(mailingId)
    })

    expect(mailingsApi.delete).toHaveBeenCalledWith(mailingId)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: mailingKeys.lists() })
  })
})
