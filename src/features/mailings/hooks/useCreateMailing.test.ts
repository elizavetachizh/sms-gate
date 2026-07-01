import '@/test/mocks/shared-api'
import { describe, expect, it, vi } from 'vitest'
import { act } from '@testing-library/react'
import { mailingsApi } from '@/test/mocks/shared-api'
import {
  createHookWrapper,
  createTestQueryClient,
  renderHook,
} from '@/test/utils/render-hook'
import { mailingFixture } from '@/test/fixtures'
import { mailingKeys } from '../api/mailings.keys'
import { useCreateMailing } from './useCreateMailing'

describe('useCreateMailing', () => {
  it('creates mailing and updates cache', async () => {
    const queryClient = createTestQueryClient()
    const payload = {
      provider_code: 'fake',
      messages: [{ msisdn: '375291234567', text: 'Hello' }],
    }
    const mailing = mailingFixture()
    vi.mocked(mailingsApi.create).mockResolvedValue(mailing)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData')

    const { result } = renderHook(() => useCreateMailing(), {
      wrapper: createHookWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync(payload)
    })

    expect(mailingsApi.create).toHaveBeenCalledWith(payload)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: mailingKeys.lists() })
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      mailingKeys.detail(mailing.id),
      mailing,
    )
  })
})
