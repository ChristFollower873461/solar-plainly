import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialData } from '../data/defaults'

const mocks = vi.hoisted(() => ({ openDB: vi.fn(), get: vi.fn(), put: vi.fn(), delete: vi.fn() }))
vi.mock('idb', () => ({ openDB: mocks.openDB }))

beforeEach(() => {
  vi.resetModules()
  vi.resetAllMocks()
  mocks.openDB.mockResolvedValue({ get: mocks.get, put: mocks.put, delete: mocks.delete })
})

describe('stored record validation', () => {
  it.each([null, false, 0, ''])('rejects invalid stored value %j instead of treating it as missing', async (value) => {
    mocks.get.mockResolvedValue(value)
    const { loadSolarData } = await import('./storage')
    await expect(loadSolarData()).rejects.toThrow()
    expect(mocks.put).not.toHaveBeenCalled()
    expect(mocks.delete).not.toHaveBeenCalled()
  })

  it('distinguishes a missing record from a valid saved record', async () => {
    const stored = createInitialData()
    mocks.get.mockResolvedValueOnce(undefined).mockResolvedValueOnce(stored)
    const { loadSolarData } = await import('./storage')
    await expect(loadSolarData()).resolves.toBeUndefined()
    await expect(loadSolarData()).resolves.toEqual(stored)
  })

  it('can reopen storage after a failed initial database open', async () => {
    const stored = createInitialData()
    mocks.openDB.mockRejectedValueOnce(new Error('Open temporarily unavailable'))
    mocks.get.mockResolvedValue(stored)
    const { loadSolarData } = await import('./storage')

    await expect(loadSolarData()).rejects.toThrow('Open temporarily unavailable')
    await expect(loadSolarData()).resolves.toEqual(stored)
    expect(mocks.openDB).toHaveBeenCalledTimes(2)
  })
})
