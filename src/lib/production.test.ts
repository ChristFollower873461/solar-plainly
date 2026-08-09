import { describe, expect, it } from 'vitest'
import type { ProductionEntry } from '../types'
import { calculateAnnualComparison, nextDueDate } from './production'

const entry = (month: string, kwh: number): ProductionEntry => ({
  id: month,
  month,
  kwh,
  notes: '',
})

describe('calculateAnnualComparison', () => {
  it('compares the latest two sets of twelve entries', () => {
    const entries = [
      ...Array.from({ length: 12 }, (_, index) => entry(`2024-${String(index + 1).padStart(2, '0')}`, 100)),
      ...Array.from({ length: 12 }, (_, index) => entry(`2025-${String(index + 1).padStart(2, '0')}`, 85)),
    ]

    expect(calculateAnnualComparison(entries)).toMatchObject({
      previousKwh: 1200,
      latestKwh: 1020,
      changePercent: -15,
    })
  })

  it('waits for twenty-four entries before comparing', () => {
    expect(calculateAnnualComparison([entry('2025-01', 100)])).toBeNull()
  })
})

describe('nextDueDate', () => {
  it('advances recurring dates', () => {
    expect(nextDueDate('2026-01-15', 'quarterly')).toBe('2026-04-15')
    expect(nextDueDate('2026-01-15', 'yearly')).toBe('2027-01-15')
    expect(nextDueDate('2026-01-31', 'monthly')).toBe('2026-02-28')
  })

  it('leaves one-time dates unchanged', () => {
    expect(nextDueDate('2026-01-15', 'once')).toBe('2026-01-15')
  })
})
