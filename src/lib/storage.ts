import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { parseBackup } from './backup'
import type { SolarData } from '../types'

interface SolarPlainlyDb extends DBSchema {
  app: {
    key: 'solar-data'
    value: unknown
  }
}

let database: Promise<IDBPDatabase<SolarPlainlyDb>> | undefined

const getDatabase = () => {
  database ??= openDB<SolarPlainlyDb>('solar-plainly', 1, {
    upgrade(db) {
      db.createObjectStore('app')
    },
    terminated() {
      database = undefined
    },
  }).catch((error) => {
    database = undefined
    throw error
  })
  return database
}

export const loadSolarData = async () => {
  const db = await getDatabase()
  const stored = await db.get('app', 'solar-data')
  return stored === undefined ? undefined : parseBackup(stored)
}

export const saveSolarData = async (data: SolarData) => {
  const db = await getDatabase()
  await db.put('app', data, 'solar-data')
}

export const clearSolarData = async () => {
  const db = await getDatabase()
  await db.delete('app', 'solar-data')
}
