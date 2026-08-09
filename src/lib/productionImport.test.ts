import { describe, expect, it } from 'vitest'
import { parseProductionCsvText } from './productionImport'

describe('parseProductionCsvText', () => {
  it('aggregates daily kWh rows into months', () => {
    const entries = parseProductionCsvText(`Date,Production (kWh)\n2026-01-01,12.5\n2026-01-02,13.25\n2026-02-01,20`)
    expect(entries).toEqual([
      expect.objectContaining({ month: '2026-01', kwh: 25.75 }),
      expect.objectContaining({ month: '2026-02', kwh: 20 }),
    ])
  })

  it('converts watt-hour exports to kWh', () => {
    const entries = parseProductionCsvText(`Month,Generated Energy (Wh)\n2026-01,125000`)
    expect(entries[0]).toEqual(expect.objectContaining({ month: '2026-01', kwh: 125 }))
  })

  it('rejects a file without recognizable columns', () => {
    expect(() => parseProductionCsvText(`Name,Value\nJanuary,100`)).toThrow(/date or month column/i)
  })
})
