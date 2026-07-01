import '@/test/mocks/shared-api'
import { act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { mailingsApi } from '@/test/mocks/shared-api'
import {
  createHookWrapper,
  createTestQueryClient,
  renderHook,
} from '@/test/utils/render-hook'
import { mailingKeys } from '../api/mailings.keys'
import { useSendMailing } from './useSendMailing'

describe('useSendMailing', () => {
  it('sends mailing and invalidates detail and list', async () => {
    const queryClient = createTestQueryClient()
    const mailingId = '660e8400-e29b-41d4-a716-446655440001'
    vi.mocked(mailingsApi.send).mockResolvedValue({ message: 'Mailing batched' })

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useSendMailing(mailingId), {
      wrapper: createHookWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(mailingsApi.send).toHaveBeenCalledWith(mailingId)
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: mailingKeys.detail(mailingId),
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: mailingKeys.lists() })
  })
})
