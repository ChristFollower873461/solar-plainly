export type AppView = 'home' | 'check' | 'record' | 'care' | 'settings'

export type OwnershipType = 'cash' | 'loan' | 'lease' | 'ppa' | 'unknown'

export type FindingSeverity = 'important' | 'review' | 'found'

export type FindingStatus = 'open' | 'resolved'

export interface ContractPage {
  number: number
  text: string
}

export interface FindingSource {
  page: number
  excerpt: string
}

export interface ContractFinding {
  id: string
  category: string
  title: string
  explanation: string
  question: string
  severity: FindingSeverity
  status: FindingStatus
  source?: FindingSource
  note?: string
}

export interface ContractFact {
  id: string
  label: string
  value: string
  source: FindingSource
}

export interface CoverageItem {
  id: string
  label: string
  found: boolean
  guidance: string
}

export interface ContractReview {
  id: string
  name: string
  importedAt: string
  pages: ContractPage[]
  findings: ContractFinding[]
  facts: ContractFact[]
  coverage: CoverageItem[]
}

export interface SystemProfile {
  nickname: string
  location: string
  ownership: OwnershipType
  systemSizeKw: string
  expectedAnnualKwh: string
  installer: string
  utility: string
  permissionToOperateDate: string
  monitoringUrl: string
  notes: string
}

export type EquipmentType =
  | 'panel'
  | 'inverter'
  | 'battery'
  | 'optimizer'
  | 'racking'
  | 'other'

export interface EquipmentItem {
  id: string
  type: EquipmentType
  manufacturer: string
  model: string
  quantity: number
  serialNumber: string
  warrantyEnd: string
  notes: string
}

export type DocumentKind =
  | 'contract'
  | 'warranty'
  | 'permit'
  | 'inspection'
  | 'utility'
  | 'manual'
  | 'other'

export interface StoredDocument {
  id: string
  name: string
  kind: DocumentKind
  addedAt: string
  expiresAt: string
  size: number
  mimeType: string
  dataUrl: string
}

export type TaskFrequency = 'once' | 'monthly' | 'quarterly' | 'twice-yearly' | 'yearly'

export interface MaintenanceTask {
  id: string
  title: string
  dueDate: string
  frequency: TaskFrequency
  completedAt: string | null
  notes: string
}

export interface ProductionEntry {
  id: string
  month: string
  kwh: number
  notes: string
}

export type IssueStatus = 'watching' | 'contacted' | 'scheduled' | 'resolved'

export interface SystemIssue {
  id: string
  title: string
  openedAt: string
  status: IssueStatus
  contact: string
  notes: string
}

export interface SolarData {
  schemaVersion: 1
  updatedAt: string
  profile: SystemProfile
  reviews: ContractReview[]
  equipment: EquipmentItem[]
  documents: StoredDocument[]
  tasks: MaintenanceTask[]
  production: ProductionEntry[]
  issues: SystemIssue[]
}

export type UpdateSolarData = (mutate: (draft: SolarData) => void) => void
