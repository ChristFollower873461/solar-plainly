import { z } from 'zod'
import type { SolarData, StoredDocument } from '../types'

const string = z.string()
const storedDataUrlPattern = /^data:[^,]*;base64,/i

const sourceSchema = z.object({ page: z.number().int().positive(), excerpt: string })

const findingSchema = z.object({
  id: string,
  category: string,
  title: string,
  explanation: string,
  question: string,
  severity: z.enum(['important', 'review', 'found']),
  status: z.enum(['open', 'resolved']),
  source: sourceSchema.optional(),
  note: string.optional(),
})

const solarDataSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: string,
  profile: z.object({
    nickname: string,
    location: string,
    ownership: z.enum(['cash', 'loan', 'lease', 'ppa', 'unknown']),
    systemSizeKw: string,
    expectedAnnualKwh: string,
    installer: string,
    utility: string,
    permissionToOperateDate: string,
    monitoringUrl: string,
    notes: string,
  }),
  reviews: z.array(
    z.object({
      id: string,
      name: string,
      importedAt: string,
      pages: z.array(z.object({ number: z.number(), text: string })),
      findings: z.array(findingSchema),
      facts: z.array(
        z.object({ id: string, label: string, value: string, source: sourceSchema }),
      ),
      coverage: z.array(
        z.object({ id: string, label: string, found: z.boolean(), guidance: string }),
      ),
    }),
  ),
  equipment: z.array(
    z.object({
      id: string,
      type: z.enum(['panel', 'inverter', 'battery', 'optimizer', 'racking', 'other']),
      manufacturer: string,
      model: string,
      quantity: z.number().int().positive(),
      serialNumber: string,
      warrantyEnd: string,
      notes: string,
    }),
  ),
  documents: z.array(
    z.object({
      id: string,
      name: string,
      kind: z.enum(['contract', 'warranty', 'permit', 'inspection', 'utility', 'manual', 'other']),
      addedAt: string,
      expiresAt: string,
      size: z.number().nonnegative(),
      mimeType: string,
      dataUrl: string.regex(storedDataUrlPattern),
    }),
  ),
  tasks: z.array(
    z.object({
      id: string,
      title: string,
      dueDate: string,
      frequency: z.enum(['once', 'monthly', 'quarterly', 'twice-yearly', 'yearly']),
      completedAt: string.nullable(),
      notes: string,
    }),
  ),
  production: z.array(
    z.object({ id: string, month: string, kwh: z.number().nonnegative(), notes: string }),
  ),
  issues: z.array(
    z.object({
      id: string,
      title: string,
      openedAt: string,
      status: z.enum(['watching', 'contacted', 'scheduled', 'resolved']),
      contact: string,
      notes: string,
    }),
  ),
})

export const parseBackup = (value: unknown): SolarData => solarDataSchema.parse(value)

export const downloadJsonBackup = (data: SolarData) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `solar-plainly-backup-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export const readJsonBackup = async (file: File) => {
  if (file.size > 60 * 1024 * 1024) throw new Error('Backups must be smaller than 60 MB.')
  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  const result = solarDataSchema.safeParse(parsed)
  if (!result.success) throw new Error('That is not a valid Solar Plainly backup.')
  return result.data
}

export const readDocumentFile = async (
  file: File,
  kind: StoredDocument['kind'],
): Promise<StoredDocument> => {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Each saved document must be smaller than 10 MB.')
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('The browser could not read that file.'))
    reader.readAsDataURL(file)
  })
  return {
    id: crypto.randomUUID(),
    name: file.name,
    kind,
    addedAt: new Date().toISOString(),
    expiresAt: '',
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    dataUrl,
  }
}

export const downloadStoredDocument = (document: StoredDocument) => {
  if (!storedDataUrlPattern.test(document.dataUrl)) {
    throw new Error('The saved document does not contain a valid local file.')
  }
  const link = window.document.createElement('a')
  link.href = document.dataUrl
  link.download = document.name
  link.click()
}
