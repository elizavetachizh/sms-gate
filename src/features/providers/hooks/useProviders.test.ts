import '@/test/mocks/shared-api'
import { describe, expect, it, vi } from 'vitest'
import { providersApi } from '@/test/mocks/shared-api'
import { createHookWrapper, renderHook, waitFor } from '@/test/utils/render-hook'
import { providersListFixture } from '@/test/fixtures'
import { useProviders } from './useProviders'

describe('useProviders', () => {
  it('loads enabled providers by default', async () => {
    vi.mocked(providersApi.list).mockResolvedValue(providersListFixture)

    const { result } = renderHook(() => useProviders(), {
      wrapper: createHookWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(providersApi.list).toHaveBeenCalledWith({ enabled_only: true })
    expect(result.current.data).toEqual(providersListFixture)
  })

  it('passes custom list params', async () => {
    vi.mocked(providersApi.list).mockResolvedValue(providersListFixture)

    renderHook(() => useProviders({ enabled_only: false }), {
      wrapper: createHookWrapper(),
    })

    await waitFor(() =>
      expect(providersApi.list).toHaveBeenCalledWith({ enabled_only: false }),
    )
  })
})
