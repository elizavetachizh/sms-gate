import '@/test/mocks/shared-api'
import { describe, expect, it, vi } from 'vitest'
import { UnauthorizedError } from '@/shared/api'
import { meApi } from '@/test/mocks/shared-api'
import { createHookWrapper, renderHook, waitFor } from '@/test/utils/render-hook'
import { userFixture } from '@/test/fixtures'
import { useMe } from './useMe'

describe('useMe', () => {
  it('loads current user', async () => {
    vi.mocked(meApi.get).mockResolvedValue(userFixture)

    const { result } = renderHook(() => useMe(), {
      wrapper: createHookWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(meApi.get).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual(userFixture)
  })

  it('surfaces unauthorized error', async () => {
    vi.mocked(meApi.get).mockRejectedValue(new UnauthorizedError())

    const { result } = renderHook(() => useMe(), {
      wrapper: createHookWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeInstanceOf(UnauthorizedError)
  })
})
