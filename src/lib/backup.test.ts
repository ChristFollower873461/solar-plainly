import { describe, expect, it } from 'vitest'
import { createInitialData, sampleContractPages } from '../data/defaults'
import { analyzeContractPages } from './contractAnalyzer'
import { parseBackup } from './backup'

describe('parseBackup', () => {
  it('accepts the current schema', () => {
    const data = createInitialData()
    expect(parseBackup(data).schemaVersion).toBe(2)
  })

  it('migrates a version 1 review into the deal and packet model', () => {
    const current = createInitialData()
    const analysis = analyzeContractPages(sampleContractPages)
    const legacy = {
      ...current,
      schemaVersion: 1,
      reviews: [{
        id: 'legacy-review',
        name: 'Old review',
        importedAt: new Date().toISOString(),
        pages: sampleContractPages,
        ...analysis,
      }],
    }

    const migrated = parseBackup(legacy)
    expect(migrated.schemaVersion).toBe(2)
    expect(migrated.reviews[0].deal.financedAmount).toBe('42900')
    expect(migrated.reviews[0].deal.monthlyPayment).toBe('159.00')
    expect(migrated.reviews[0].packet).toHaveLength(8)
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
