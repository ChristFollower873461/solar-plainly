import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialData } from '../data/defaults'
import { clearSolarData, loadSolarData, saveSolarData } from '../lib/storage'
import { useSolarData } from './useSolarData'

vi.mock('../lib/storage', () => ({
  loadSolarData: vi.fn(),
  saveSolarData: vi.fn(),
  clearSolarData: vi.fn(),
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.resetAllMocks()
  vi.mocked(saveSolarData).mockResolvedValue(undefined)
  vi.mocked(clearSolarData).mockResolvedValue(undefined)
})

afterEach(() => vi.useRealTimers())

const settleAutosave = async () => {
  await act(async () => {})
  await act(async () => { await vi.advanceTimersByTimeAsync(250) })
}

describe('local record loading', () => {
  it('does not overwrite a record when reading or validation fails', async () => {
    vi.mocked(loadSolarData).mockRejectedValue(new Error('Unreadable saved record'))
    const { result } = renderHook(() => useSolarData())

    await settleAutosave()

    expect(saveSolarData).not.toHaveBeenCalled()
    expect(clearSolarData).not.toHaveBeenCalled()
    expect(result.current.ready).toBe(false)
    expect(result.current.loadError).toBe(true)
  })

  it('waits for a successful read before saving the existing record', async () => {
    const stored = createInitialData()
    stored.profile.nickname = 'Existing homeowner record'
    let finishRead!: (value: typeof stored) => void
    vi.mocked(loadSolarData).mockReturnValue(new Promise((resolve) => { finishRead = resolve }))
    const { result } = renderHook(() => useSolarData())

    await settleAutosave()
    expect(result.current.ready).toBe(false)
    expect(saveSolarData).not.toHaveBeenCalled()

    await act(async () => { finishRead(stored) })
    await settleAutosave()
    expect(result.current.ready).toBe(true)
    expect(result.current.data.profile.nickname).toBe('Existing homeowner record')
    expect(saveSolarData).toHaveBeenCalledExactlyOnceWith(stored)
  })

  it('initializes a new record only after storage confirms none exists', async () => {
    vi.mocked(loadSolarData).mockResolvedValue(undefined)
    const { result } = renderHook(() => useSolarData())

    await settleAutosave()

    expect(result.current.ready).toBe(true)
    expect(result.current.loadError).toBe(false)
    expect(saveSolarData).toHaveBeenCalledExactlyOnceWith(result.current.data)
  })

  it('retries a failed read and resumes with the recovered record', async () => {
    const stored = createInitialData()
    stored.profile.nickname = 'Recovered record'
    vi.mocked(loadSolarData).mockRejectedValueOnce(new Error('Read unavailable')).mockResolvedValueOnce(stored)
    const { result } = renderHook(() => useSolarData())
    await settleAutosave()

    await act(async () => { result.current.retryLoad() })
    await settleAutosave()

    expect(loadSolarData).toHaveBeenCalledTimes(2)
    expect(result.current.ready).toBe(true)
    expect(result.current.loadError).toBe(false)
    expect(saveSolarData).toHaveBeenCalledExactlyOnceWith(stored)
  })

  it('keeps repeated failed retries read-only', async () => {
    vi.mocked(loadSolarData).mockRejectedValue(new Error('Still unreadable'))
    const { result } = renderHook(() => useSolarData())
    await settleAutosave()

    await act(async () => { result.current.retryLoad() })
    await settleAutosave()

    expect(loadSolarData).toHaveBeenCalledTimes(2)
    expect(result.current.loadError).toBe(true)
    expect(saveSolarData).not.toHaveBeenCalled()
    expect(clearSolarData).not.toHaveBeenCalled()
  })

  it('does not save a read that completes after unmount', async () => {
    let finishRead!: (value: ReturnType<typeof createInitialData>) => void
    vi.mocked(loadSolarData).mockReturnValue(new Promise((resolve) => { finishRead = resolve }))
    const { unmount } = renderHook(() => useSolarData())
    unmount()

    await act(async () => { finishRead(createInitialData()) })
    await settleAutosave()

    expect(saveSolarData).not.toHaveBeenCalled()
  })
})
