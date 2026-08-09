import {
  BatteryCharging,
  Download,
  FileArchive,
  HardHat,
  PackagePlus,
  Plus,
  Save,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { downloadStoredDocument, readDocumentFile } from '../lib/backup'
import type {
  DocumentKind,
  EquipmentItem,
  EquipmentType,
  SolarData,
  UpdateSolarData,
} from '../types'

interface SystemPassportProps {
  data: SolarData
  update: UpdateSolarData
}

const blankEquipment = (): Omit<EquipmentItem, 'id'> => ({
  type: 'panel',
  manufacturer: '',
  model: '',
  quantity: 1,
  serialNumber: '',
  warrantyEnd: '',
  notes: '',
})

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const equipmentIcon: Record<EquipmentType, typeof Zap> = {
  panel: Zap,
  inverter: HardHat,
  battery: BatteryCharging,
  optimizer: Zap,
  racking: HardHat,
  other: PackagePlus,
}

export function SystemPassport({ data, update }: SystemPassportProps) {
  const [showEquipmentForm, setShowEquipmentForm] = useState(false)
  const [equipment, setEquipment] = useState(blankEquipment)
  const [documentKind, setDocumentKind] = useState<DocumentKind>('warranty')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const updateProfile = (field: keyof SolarData['profile'], value: string) => {
    update((draft) => {
      draft.profile[field] = value as never
    })
  }

  const addEquipment = () => {
    if (!equipment.manufacturer.trim() && !equipment.model.trim()) {
      setError('Add a manufacturer or model before saving equipment.')
      return
    }
    update((draft) => {
      draft.equipment.push({ id: crypto.randomUUID(), ...equipment })
    })
    setEquipment(blankEquipment())
    setShowEquipmentForm(false)
    setError('')
  }

  const saveDocument = async (file?: File) => {
    if (!file) return
    setError('')
    try {
      const document = await readDocumentFile(file, documentKind)
      update((draft) => {
        draft.documents.unshift(document)
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The document could not be saved.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="page-stack record-page">
      <section className="record-intro">
        <div>
          <p className="eyebrow">System passport</p>
          <h2>{data.profile.nickname || 'The facts that stay with the home'}</h2>
          <p>Keep ownership, equipment, warranties, and handoff details in one portable record.</p>
        </div>
        <div className="record-counts">
          <span><strong>{data.equipment.length}</strong> Equipment</span>
          <span><strong>{data.documents.length}</strong> Documents</span>
        </div>
      </section>

      <section className="form-section" aria-labelledby="system-basics-title">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Basics</p>
            <h2 id="system-basics-title">System details</h2>
          </div>
          <span className="autosave-label"><Save size={15} /> Autosaved</span>
        </div>
        <div className="form-grid">
          <label>
            Record name
            <input
              onChange={(event) => updateProfile('nickname', event.target.value)}
              placeholder="Home solar"
              value={data.profile.nickname}
            />
          </label>
          <label>
            City or region
            <input
              onChange={(event) => updateProfile('location', event.target.value)}
              placeholder="Optional - avoid a full address"
              value={data.profile.location}
            />
          </label>
          <label>
            Ownership
            <select
              onChange={(event) => updateProfile('ownership', event.target.value)}
              value={data.profile.ownership}
            >
              <option value="unknown">Not recorded</option>
              <option value="cash">Owned - cash</option>
              <option value="loan">Owned - loan</option>
              <option value="lease">Lease</option>
              <option value="ppa">Power purchase agreement</option>
            </select>
          </label>
          <label>
            System size (kW DC)
            <input
              inputMode="decimal"
              onChange={(event) => updateProfile('systemSizeKw', event.target.value)}
              placeholder="9.6"
              value={data.profile.systemSizeKw}
            />
          </label>
          <label>
            Expected annual production (kWh)
            <input
              inputMode="numeric"
              onChange={(event) => updateProfile('expectedAnnualKwh', event.target.value)}
              placeholder="13800"
              value={data.profile.expectedAnnualKwh}
            />
          </label>
          <label>
            Permission to operate date
            <input
              onChange={(event) => updateProfile('permissionToOperateDate', event.target.value)}
              type="date"
              value={data.profile.permissionToOperateDate}
            />
          </label>
          <label>
            Installer
            <input
              onChange={(event) => updateProfile('installer', event.target.value)}
              placeholder="Company and service number"
              value={data.profile.installer}
            />
          </label>
          <label>
            Utility
            <input
              onChange={(event) => updateProfile('utility', event.target.value)}
              placeholder="Utility provider"
              value={data.profile.utility}
            />
          </label>
          <label className="span-two">
            Monitoring portal
            <input
              onChange={(event) => updateProfile('monitoringUrl', event.target.value)}
              placeholder="https://..."
              type="url"
              value={data.profile.monitoringUrl}
            />
          </label>
          <label className="span-two">
            Handoff notes
            <textarea
              onChange={(event) => updateProfile('notes', event.target.value)}
              placeholder="Account transfer steps, service contacts, roof notes, or anything a future owner should know."
              rows={4}
              value={data.profile.notes}
            />
          </label>
        </div>
      </section>

      <section aria-labelledby="equipment-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Hardware</p>
            <h2 id="equipment-title">Equipment</h2>
          </div>
          <button className="secondary-button" onClick={() => setShowEquipmentForm((value) => !value)} type="button">
            <Plus size={17} /> Add equipment
          </button>
        </div>

        {showEquipmentForm && (
          <div className="inline-form equipment-form">
            <label>
              Type
              <select
                onChange={(event) => setEquipment({ ...equipment, type: event.target.value as EquipmentType })}
                value={equipment.type}
              >
                <option value="panel">Panel</option>
                <option value="inverter">Inverter</option>
                <option value="battery">Battery</option>
                <option value="optimizer">Optimizer</option>
                <option value="racking">Racking</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Manufacturer
              <input onChange={(event) => setEquipment({ ...equipment, manufacturer: event.target.value })} value={equipment.manufacturer} />
            </label>
            <label>
              Model
              <input onChange={(event) => setEquipment({ ...equipment, model: event.target.value })} value={equipment.model} />
            </label>
            <label>
              Quantity
              <input min="1" onChange={(event) => setEquipment({ ...equipment, quantity: Math.max(1, Number(event.target.value)) })} type="number" value={equipment.quantity} />
            </label>
            <label>
              Serial number
              <input onChange={(event) => setEquipment({ ...equipment, serialNumber: event.target.value })} value={equipment.serialNumber} />
            </label>
            <label>
              Warranty end
              <input onChange={(event) => setEquipment({ ...equipment, warrantyEnd: event.target.value })} type="date" value={equipment.warrantyEnd} />
            </label>
            <label className="span-two">
              Notes
              <input onChange={(event) => setEquipment({ ...equipment, notes: event.target.value })} value={equipment.notes} />
            </label>
            <div className="inline-form-actions span-two">
              <button className="text-button" onClick={() => setShowEquipmentForm(false)} type="button">Cancel</button>
              <button className="primary-button" onClick={addEquipment} type="button"><Plus size={17} /> Add</button>
            </div>
          </div>
        )}

        {data.equipment.length === 0 ? (
          <div className="empty-message compact-empty">
            <PackagePlus size={23} />
            <h3>No equipment recorded</h3>
            <p>Start with the panel and inverter model from the final design or label.</p>
          </div>
        ) : (
          <div className="equipment-list">
            {data.equipment.map((item) => {
              const Icon = equipmentIcon[item.type]
              return (
                <article className="equipment-item" key={item.id}>
                  <div className="equipment-icon"><Icon size={21} /></div>
                  <div>
                    <span>{item.type}</span>
                    <h3>{[item.manufacturer, item.model].filter(Boolean).join(' ')}</h3>
                    <p>
                      Qty {item.quantity}
                      {item.serialNumber ? ` / Serial ${item.serialNumber}` : ''}
                      {item.warrantyEnd ? ` / Warranty to ${item.warrantyEnd}` : ''}
                    </p>
                    {item.notes && <small>{item.notes}</small>}
                  </div>
                  <button
                    aria-label={`Delete ${item.manufacturer} ${item.model}`}
                    className="icon-button danger"
                    onClick={() => update((draft) => { draft.equipment = draft.equipment.filter((entry) => entry.id !== item.id) })}
                    title="Delete equipment"
                    type="button"
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="documents-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Local document box</p>
            <h2 id="documents-title">Documents</h2>
          </div>
          <div className="document-upload-controls">
            <select aria-label="Document type" onChange={(event) => setDocumentKind(event.target.value as DocumentKind)} value={documentKind}>
              <option value="contract">Contract</option>
              <option value="warranty">Warranty</option>
              <option value="permit">Permit</option>
              <option value="inspection">Inspection</option>
              <option value="utility">Utility / PTO</option>
              <option value="manual">Manual</option>
              <option value="other">Other</option>
            </select>
            <button className="secondary-button" onClick={() => fileRef.current?.click()} type="button"><Upload size={17} /> Save file</button>
            <input hidden onChange={(event) => void saveDocument(event.target.files?.[0])} ref={fileRef} type="file" />
          </div>
        </div>

        {data.documents.length === 0 ? (
          <div className="empty-message compact-empty">
            <FileArchive size={23} />
            <h3>No documents saved</h3>
            <p>Files stay in this browser and are included in your exported backup.</p>
          </div>
        ) : (
          <div className="document-list">
            {data.documents.map((document) => (
              <article className="document-item" key={document.id}>
                <FileArchive size={20} />
                <div>
                  <h3>{document.name}</h3>
                  <p>{document.kind} / {formatBytes(document.size)}</p>
                </div>
                <button aria-label={`Download ${document.name}`} className="icon-button" onClick={() => downloadStoredDocument(document)} title="Download" type="button"><Download size={17} /></button>
                <button aria-label={`Delete ${document.name}`} className="icon-button danger" onClick={() => update((draft) => { draft.documents = draft.documents.filter((item) => item.id !== document.id) })} title="Delete" type="button"><Trash2 size={17} /></button>
              </article>
            ))}
          </div>
        )}
      </section>

      {error && <div className="inline-alert error" role="alert">{error}</div>}
      <p className="legal-note">Browser storage can be cleared by the operating system or user. Export a backup after important changes.</p>
    </div>
  )
}
