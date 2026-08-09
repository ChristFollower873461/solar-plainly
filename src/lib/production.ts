import type { ProductionEntry } from '../types'

export interface AnnualComparison {
  latestKwh: number
  previousKwh: number
  changePercent: number
  latestPeriod: string
  previousPeriod: string
}

const periodLabel = (entries: ProductionEntry[]) => {
  if (!entries.length) return ''
  const first = entries[0].month
  const last = entries[entries.length - 1].month
  return `${first} to ${last}`
}

export const calculateAnnualComparison = (
  entries: ProductionEntry[],
): AnnualComparison | null => {
  const sorted = [...entries].sort((a, b) => a.month.localeCompare(b.month))
  if (sorted.length < 24) return null

  const latest = sorted.slice(-12)
  const previous = sorted.slice(-24, -12)
  const latestKwh = latest.reduce((sum, entry) => sum + entry.kwh, 0)
  const previousKwh = previous.reduce((sum, entry) => sum + entry.kwh, 0)
  if (previousKwh <= 0) return null

  return {
    latestKwh,
    previousKwh,
    changePercent: ((latestKwh - previousKwh) / previousKwh) * 100,
    latestPeriod: periodLabel(latest),
    previousPeriod: periodLabel(previous),
  }
}

export const nextDueDate = (current: string, frequency: string) => {
  const date = new Date(`${current}T12:00:00`)
  const months: Record<string, number> = {
    monthly: 1,
    quarterly: 3,
    'twice-yearly': 6,
    yearly: 12,
  }
  const increment = months[frequency]
  if (!increment) return current
  const day = date.getDate()
  date.setDate(1)
  date.setMonth(date.getMonth() + increment)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(day, lastDay))
  return date.toISOString().slice(0, 10)
}
