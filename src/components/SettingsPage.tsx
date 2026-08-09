import {
  AlertTriangle,
  Download,
  ExternalLink,
  FileJson,
  GitFork,
  HardDrive,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { downloadJsonBackup, readJsonBackup } from '../lib/backup'
import type { SolarData } from '../types'
import { Modal } from './Modal'

interface SettingsPageProps {
  data: SolarData
  onReplace: (data: SolarData) => void
  onReset: () => Promise<void>
}

const approximateSize = (data: SolarData) => {
  const bytes = new Blob([JSON.stringify(data)]).size
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SettingsPage({ data, onReplace, onReset }: SettingsPageProps) {
  const [resetOpen, setResetOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  const importBackup = async (file?: File) => {
    if (!file) return
    try {
      onReplace(await readJsonBackup(file))
      setMessage('Backup imported. The restored record is now saved on this device.')
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'The backup could not be imported.')
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  const eraseEverything = async () => {
    if (confirmation !== 'DELETE') return
    await onReset()
    setConfirmation('')
    setResetOpen(false)
    setMessage('The local Solar Plainly record was erased.')
  }

  return (
    <div className="page-stack settings-page">
      <section className="settings-intro">
        <div>
          <p className="eyebrow">Local-first</p>
          <h2>Your information does not need an account.</h2>
          <p>Solar Plainly stores its working record in this browser's IndexedDB database.</p>
        </div>
        <ShieldCheck size={38} />
      </section>

      <section className="settings-section" aria-labelledby="data-title">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Portable by design</p>
            <h2 id="data-title">Your data</h2>
          </div>
          <span className="data-size"><HardDrive size={16} /> About {approximateSize(data)}</span>
        </div>
        <div className="setting-rows">
          <div className="setting-row">
            <FileJson size={21} />
            <div><h3>Export backup</h3><p>Download the complete record and saved files as one JSON backup.</p></div>
            <button className="secondary-button" onClick={() => downloadJsonBackup(data)} type="button"><Download size={17} /> Export</button>
          </div>
          <div className="setting-row">
            <Upload size={21} />
            <div><h3>Import backup</h3><p>Replace this browser's record with a Solar Plainly version 1 or 2 backup.</p></div>
            <button className="secondary-button" onClick={() => importRef.current?.click()} type="button"><Upload size={17} /> Import</button>
            <input accept="application/json,.json" hidden onChange={(event) => void importBackup(event.target.files?.[0])} ref={importRef} type="file" />
          </div>
          <div className="setting-row danger-row">
            <RotateCcw size={21} />
            <div><h3>Erase local record</h3><p>Delete reviews, profile details, documents, care history, and issues from this browser.</p></div>
            <button className="danger-button" onClick={() => setResetOpen(true)} type="button">Erase</button>
          </div>
        </div>
        {message && <div className="inline-alert info" role="status">{message}</div>}
      </section>

      <section className="settings-section" aria-labelledby="privacy-title">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Plain language</p>
            <h2 id="privacy-title">Privacy and limits</h2>
          </div>
        </div>
        <div className="privacy-grid">
          <div><LockKeyhole size={20} /><h3>No server account</h3><p>The app has no login, analytics, advertising, lead sale, or cloud document endpoint.</p></div>
          <div><ShieldCheck size={20} /><h3>Local processing</h3><p>PDF text extraction and rule-based checking run in the browser. External resource links open only when selected.</p></div>
          <div><AlertTriangle size={20} /><h3>No professional verdict</h3><p>The checker can miss or misunderstand language. It does not provide legal, tax, financial, engineering, or warranty advice.</p></div>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="resources-title">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Primary sources</p>
            <h2 id="resources-title">Current homeowner resources</h2>
          </div>
        </div>
        <div className="resource-list">
          <a href="https://www.energy.gov/cmei/systems/homeowners-guide-solar" rel="noreferrer" target="_blank"><span>U.S. Department of Energy</span><strong>Homeowner's Guide to Solar</strong><ExternalLink size={17} /></a>
          <a href="https://www.consumerfinance.gov/data-research/research-reports/issue-spotlight-solar-financing/" rel="noreferrer" target="_blank"><span>Consumer Financial Protection Bureau</span><strong>Solar Financing Issue Spotlight</strong><ExternalLink size={17} /></a>
          <a href="https://consumer.ftc.gov/consumer-alerts/2024/09/solar-energy-rising-popularity-so-are-scams" rel="noreferrer" target="_blank"><span>Federal Trade Commission</span><strong>Solar scams and contract pressure</strong><ExternalLink size={17} /></a>
          <a href="https://www.irs.gov/credits-deductions/residential-clean-energy-credit" rel="noreferrer" target="_blank"><span>Internal Revenue Service</span><strong>Current residential clean-energy credit guidance</strong><ExternalLink size={17} /></a>
        </div>
      </section>

      <section className="open-source-band">
        <GitFork size={24} />
        <div><h2>Open source, inspectable, and forkable</h2><p>MIT licensed. The rules and data model are visible; there is no hidden scoring service.</p></div>
        <a className="secondary-button" href="https://github.com/ChristFollower873461/solar-plainly" rel="noreferrer" target="_blank">View source <ExternalLink size={16} /></a>
      </section>

      <footer className="app-footer">
        <span>Solar Plainly v0.2.0</span>
        <span>Educational software</span>
        <span>Last saved {new Date(data.updatedAt).toLocaleString()}</span>
      </footer>

      {resetOpen && (
        <Modal title="Erase the local record?" onClose={() => setResetOpen(false)}>
          <div className="modal-body">
            <p>This permanently removes the Solar Plainly data stored by this browser. Export a backup first if you may need it later.</p>
            <label>
              Type DELETE to confirm
              <input autoComplete="off" onChange={(event) => setConfirmation(event.target.value)} value={confirmation} />
            </label>
          </div>
          <div className="modal-actions">
            <button className="text-button" onClick={() => setResetOpen(false)} type="button">Cancel</button>
            <button className="danger-button" disabled={confirmation !== 'DELETE'} onClick={() => void eraseEverything()} type="button">Erase everything</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
