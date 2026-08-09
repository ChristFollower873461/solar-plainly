import Papa from 'papaparse'
import type { ProductionEntry } from '../types'

const MAX_CSV_BYTES = 5 * 1024 * 1024

const normalizedHeader = (header: string) => header.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const findHeader = (headers: string[], patterns: RegExp[]) =>
  headers.find((header) => patterns.some((pattern) => pattern.test(normalizedHeader(header))))

const monthFromValue = (raw: string) => {
  const value = raw.trim()
  const iso = value.match(/^(\d{4})[-/](\d{1,2})(?:[-/]\d{1,2})?$/)
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}`

  const usDate = value.match(/^(\d{1,2})[-/]\d{1,2}[-/](\d{2}|\d{4})$/)
  if (usDate) {
    const year = usDate[2].length === 2 ? `20${usDate[2]}` : usDate[2]
    const month = Number(usDate[1])
    if (month >= 1 && month <= 12) return `${year}-${String(month).padStart(2, '0')}`
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return undefined
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`
}

const energyScale = (header: string) => {
  const normalized = normalizedHeader(header)
  if (/\bmwh\b/.test(normalized)) return 1000
  if (/\bwh\b/.test(normalized) && !/\bkwh\b/.test(normalized)) return 0.001
  return 1
}

const energyFromValue = (raw: string, scale: number) => {
  const normalized = raw.replace(/,/g, '').replace(/[^\d.-]/g, '')
  if (!normalized) return undefined
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return undefined
  return parsed * scale
}

export const parseProductionCsvText = (text: string, fileName = 'production.csv'): ProductionEntry[] => {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
  })
  const headers = parsed.meta.fields ?? []
  const monthHeader = findHeader(headers, [
    /^(date|month|period|timestamp|time)$/,
    /production date/,
    /reporting period/,
  ])
  const energyHeader = findHeader(headers, [
    /production/,
    /energy/,
    /generated/,
    /generation/,
    /yield/,
    /^output/,
    /^kwh$/,
  ])

  if (!monthHeader || !energyHeader || monthHeader === energyHeader) {
    throw new Error('The CSV needs a date or month column and a production or energy column.')
  }

  const scale = energyScale(energyHeader)
  const monthly = new Map<string, number>()
  for (const row of parsed.data) {
    const month = monthFromValue(String(row[monthHeader] ?? ''))
    const energy = energyFromValue(String(row[energyHeader] ?? ''), scale)
    if (!month || energy === undefined) continue
    monthly.set(month, (monthly.get(month) ?? 0) + energy)
  }

  if (!monthly.size) {
    throw new Error('No valid production rows were found in that CSV.')
  }

  return [...monthly.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, kwh]) => ({
      id: crypto.randomUUID(),
      month,
      kwh: Math.round(kwh * 100) / 100,
      notes: `Imported from ${fileName}`,
    }))
}

export const readProductionCsv = async (file: File) => {
  if (file.size > MAX_CSV_BYTES) throw new Error('Production CSV files must be smaller than 5 MB.')
  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
    throw new Error('Choose a CSV export from the monitoring portal.')
  }
  return parseProductionCsvText(await file.text(), file.name)
}
