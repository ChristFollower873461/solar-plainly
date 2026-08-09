import { openDB, type DBSchema } from 'idb'
import type { SolarData } from '../types'

interface SolarPlainlyDb extends DBSchema {
  app: {
    key: 'solar-data'
    value: SolarData
  }
}

const database = openDB<SolarPlainlyDb>('solar-plainly', 1, {
  upgrade(db) {
    db.createObjectStore('app')
  },
})

export const loadSolarData = async () => {
  const db = await database
  return db.get('app', 'solar-data')
}

export const saveSolarData = async (data: SolarData) => {
  const db = await database
  await db.put('app', data, 'solar-data')
}

export const clearSolarData = async () => {
  const db = await database
  await db.delete('app', 'solar-data')
}
