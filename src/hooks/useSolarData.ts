import { useCallback, useEffect, useState } from 'react'
import { createInitialData } from '../data/defaults'
import { clearSolarData, loadSolarData, saveSolarData } from '../lib/storage'
import type { SolarData, UpdateSolarData } from '../types'

export const useSolarData = () => {
  const [data, setData] = useState<SolarData>(() => createInitialData())
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved')

  useEffect(() => {
    let active = true
    loadSolarData()
      .then((stored) => {
        if (!active) return
        if (stored) setData(stored)
        setReady(true)
      })
      .catch(() => {
        if (active) {
          setLoadError(true)
          setSaveState('error')
        }
      })
    return () => {
      active = false
    }
  }, [loadAttempt])

  const retryLoad = useCallback(() => {
    setReady(false)
    setLoadError(false)
    setLoadAttempt((attempt) => attempt + 1)
  }, [])

  useEffect(() => {
    if (!ready) return undefined
    setSaveState('saving')
    const timeout = window.setTimeout(() => {
      saveSolarData(data)
        .then(() => setSaveState('saved'))
        .catch(() => setSaveState('error'))
    }, 180)
    return () => window.clearTimeout(timeout)
  }, [data, ready])

  const update: UpdateSolarData = useCallback((mutate) => {
    setData((current) => {
      const next = structuredClone(current)
      mutate(next)
      next.updatedAt = new Date().toISOString()
      return next
    })
  }, [])

  const replace = useCallback((next: SolarData) => {
    setData({ ...next, updatedAt: new Date().toISOString() })
  }, [])

  const reset = useCallback(async () => {
    await clearSolarData()
    setData(createInitialData())
  }, [])

  return { data, ready, loadError, retryLoad, saveState, update, replace, reset }
}
