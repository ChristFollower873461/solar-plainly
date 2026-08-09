import { describe, expect, it } from 'vitest'
import { createInitialData } from '../data/defaults'
import { parseBackup } from './backup'

describe('parseBackup', () => {
  it('accepts the current schema', () => {
    const data = createInitialData()
    expect(parseBackup(data).schemaVersion).toBe(1)
  })

  it('rejects an unknown schema', () => {
    expect(() => parseBackup({ schemaVersion: 99 })).toThrow()
  })

  it('rejects a backup document with an executable URL', () => {
    const data = createInitialData()
    data.documents.push({
      id: 'unsafe-document',
      name: 'unsafe.html',
      kind: 'other',
      addedAt: new Date().toISOString(),
      expiresAt: '',
      size: 1,
      mimeType: 'text/html',
      dataUrl: 'javascript:alert(1)',
    })

    expect(() => parseBackup(data)).toThrow()
  })
})
