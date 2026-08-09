import { useCallback, useEffect, useState } from 'react'
import { createInitialData } from '../data/defaults'
import { clearSolarData, loadSolarData, saveSolarData } from '../lib/storage'
import type { SolarData, UpdateSolarData } from '../types'

export const useSolarData = () => {
  const [data, setData] = useState<SolarData>(() => createInitialData())
  const [ready, setReady] = useState(false)
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved')

  useEffect(() => {
    let active = true
    loadSolarData()
      .then((stored) => {
        if (active && stored) setData(stored)
      })
      .catch(() => {
        if (active) setSaveState('error')
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
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

  return { data, ready, saveState, update, replace, reset }
}
