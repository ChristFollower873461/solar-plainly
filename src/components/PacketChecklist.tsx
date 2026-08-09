import { AlertTriangle, CheckCircle2, Files, HelpCircle } from 'lucide-react'
import { packetDefinitions } from '../lib/deal'
import type { ContractReview, PacketStatus, UpdateSolarData } from '../types'

interface PacketChecklistProps {
  review: ContractReview
  update: UpdateSolarData
}

const statusLabel: Record<PacketStatus, string> = {
  present: 'Present',
  missing: 'Missing',
  unknown: 'Not confirmed',
  'not-applicable': 'Not applicable',
}

const statusIcon = (status: PacketStatus) => {
  if (status === 'present') return <CheckCircle2 className="packet-present" size={19} />
  if (status === 'missing') return <AlertTriangle className="packet-missing" size={19} />
  return <HelpCircle className="packet-unknown" size={19} />
}

export function PacketChecklist({ review, update }: PacketChecklistProps) {
  const documentNames = [...new Set(review.pages.map((page) => page.documentName).filter(Boolean))] as string[]
  const presentCount = review.packet.filter((item) => item.status === 'present').length
  const gapCount = review.packet.filter((item) => item.status === 'missing' || item.status === 'unknown').length

  const updateItem = (key: string, field: 'status' | 'note', value: string) => {
    update((draft) => {
      const item = draft.reviews.find((entry) => entry.id === review.id)?.packet.find((entry) => entry.key === key)
      if (!item) return
      if (field === 'status') item.status = value as PacketStatus
      else item.note = value
    })
  }

  return (
    <div className="packet-workspace">
      <section className={`packet-summary-band ${gapCount ? 'incomplete' : 'complete'}`}>
        <div>
          <p className="eyebrow">The complete packet matters</p>
          <h3>{gapCount ? `${gapCount} documents still need confirmation` : 'Packet checklist complete'}</h3>
          <p>A proposal, installation contract, and financing agreement can make different promises. Only the binding documents count.</p>
        </div>
        <div className="packet-count"><strong>{presentCount}</strong><span>confirmed</span></div>
      </section>

      <section aria-labelledby="packet-documents-title">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Text read in this review</p>
            <h3 id="packet-documents-title">Imported documents</h3>
          </div>
          <span className="document-total"><Files size={16} /> {documentNames.length || 1} {documentNames.length === 1 ? 'document' : 'documents'}</span>
        </div>
        <div className="imported-document-list">
          {(documentNames.length ? documentNames : [review.name]).map((name) => {
            const pages = review.pages.filter((page) => (page.documentName ?? review.name) === name).length
            return <div key={name}><Files size={18} /><span><strong>{name}</strong><small>{pages || review.pages.length} text {pages === 1 ? 'page' : 'pages'}</small></span></div>
          })}
        </div>
      </section>

      <section aria-labelledby="packet-checklist-title">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Confirm against your files</p>
            <h3 id="packet-checklist-title">Document checklist</h3>
          </div>
        </div>
        <div className="packet-list">
          {packetDefinitions.map((definition) => {
            const item = review.packet.find((entry) => entry.key === definition.key)
            if (!item) return null
            return (
              <div className={`packet-row ${item.status}`} key={definition.key}>
                {statusIcon(item.status)}
                <div className="packet-copy">
                  <strong>{definition.label}</strong>
                  <p>{definition.reason}</p>
                  <input
                    aria-label={`${definition.label} note`}
                    onChange={(event) => updateItem(definition.key, 'note', event.target.value)}
                    placeholder="File name, provider response, or follow-up"
                    value={item.note}
                  />
                </div>
                <select
                  aria-label={`${definition.label} status`}
                  onChange={(event) => updateItem(definition.key, 'status', event.target.value)}
                  value={item.status}
                >
                  {(Object.keys(statusLabel) as PacketStatus[]).map((status) => (
                    <option key={status} value={status}>{statusLabel[status]}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      </section>

      <p className="legal-note">
        Required documents and cancellation rules depend on the transaction and jurisdiction. A checklist item marked present means you confirmed the file, not that the document is complete or compliant.
      </p>
    </div>
  )
}
