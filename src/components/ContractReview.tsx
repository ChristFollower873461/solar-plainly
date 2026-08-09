import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  FileText,
  Files,
  Info,
  Plus,
  Printer,
  RotateCcw,
  SearchCheck,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { sampleContractPages } from '../data/defaults'
import { analyzeContractPages } from '../lib/contractAnalyzer'
import { createDealFromFacts, createPacket, missingDealTerms } from '../lib/deal'
import { readContractFile } from '../lib/pdf'
import type {
  ContractPage,
  AppView,
  FindingSeverity,
  ReviewTab,
  SolarData,
  UpdateSolarData,
} from '../types'
import { DealWorkspace } from './DealWorkspace'
import { PacketChecklist } from './PacketChecklist'
import { ReviewReport } from './ReviewReport'

interface ContractReviewProps {
  data: SolarData
  initialTab: ReviewTab
  onNavigate: (view: AppView) => void
  update: UpdateSolarData
}

type FindingFilter = 'open' | 'resolved' | 'all'

const severityMeta: Record<
  FindingSeverity,
  { label: string; icon: typeof AlertTriangle }
> = {
  important: { label: 'Needs an answer', icon: AlertTriangle },
  review: { label: 'Worth confirming', icon: Info },
  found: { label: 'Found', icon: CheckCircle2 },
}

const formatImportedAt = (date: string) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(date),
  )

const sourceLabel = (source: { page: number; documentName?: string }) =>
  `${source.documentName ? `${source.documentName}, ` : ''}page ${source.page}`

export function ContractReview({ data, initialTab, onNavigate, update }: ContractReviewProps) {
  const [selectedId, setSelectedId] = useState(data.reviews[0]?.id ?? '')
  const [adding, setAdding] = useState(data.reviews.length === 0)
  const [activeTab, setActiveTab] = useState<ReviewTab>(initialTab)
  const [filter, setFilter] = useState<FindingFilter>('open')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [manualText, setManualText] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!selectedId && data.reviews[0]) setSelectedId(data.reviews[0].id)
    if (selectedId && !data.reviews.some((review) => review.id === selectedId)) {
      setSelectedId(data.reviews[0]?.id ?? '')
    }
  }, [data.reviews, selectedId])

  const review = data.reviews.find((item) => item.id === selectedId) ?? data.reviews[0]

  const createReview = (name: string, pages: ContractPage[]) => {
    const analysis = analyzeContractPages(pages)
    const { deal, sources } = createDealFromFacts(analysis.facts)
    const documentNames = [...new Set(pages.map((page) => page.documentName).filter(Boolean))] as string[]
    const id = crypto.randomUUID()
    update((draft) => {
      draft.reviews.unshift({
        id,
        name,
        importedAt: new Date().toISOString(),
        pages,
        ...analysis,
        deal,
        dealSources: sources,
        packet: createPacket(documentNames, deal.ownership),
      })
    })
    setSelectedId(id)
    setAdding(false)
    setActiveTab('overview')
    setFilter('open')
  }

  const processFiles = async (files?: File[]) => {
    if (!files?.length) return
    if (files.length > 8) {
      setError('Review up to 8 documents in one packet.')
      return
    }
    if (files.reduce((total, file) => total + file.size, 0) > 40 * 1024 * 1024) {
      setError('The complete packet must be smaller than 40 MB.')
      return
    }

    setError('')
    setProcessing(true)
    const pages: ContractPage[] = []
    const failures: string[] = []
    try {
      for (const file of files) {
        try {
          const documentPages = await readContractFile(file)
          pages.push(...documentPages.map((page) => ({ ...page, documentName: file.name })))
        } catch (caught) {
          failures.push(`${file.name}: ${caught instanceof Error ? caught.message : 'could not be read'}`)
        }
      }
      if (pages.length > 250) throw new Error('The complete packet has more than 250 text pages. Split it into separate reviews.')
      if (!pages.length) throw new Error(failures.join(' ') || 'The packet could not be read.')
      const name = files.length === 1 ? files[0].name : `${files.length}-document solar packet`
      createReview(name, pages)
      if (failures.length) setError(`The review was created, but ${failures.join(' ')}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The contract packet could not be read.')
    } finally {
      setProcessing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    void processFiles(Array.from(event.dataTransfer.files))
  }

  const analyzePastedText = () => {
    const text = manualText.trim()
    if (text.length < 80) {
      setError('Paste at least a few paragraphs so the check has enough context.')
      return
    }
    createReview('Pasted contract text', [{ number: 1, text, documentName: 'Pasted contract text' }])
    setManualText('')
  }

  const findings = useMemo(() => {
    if (!review) return []
    const priority: Record<FindingSeverity, number> = { important: 0, review: 1, found: 2 }
    return review.findings
      .filter((finding) => filter === 'all' || finding.status === filter)
      .sort((a, b) => priority[a.severity] - priority[b.severity])
  }, [filter, review])

  const toggleFinding = (findingId: string) => {
    if (!review) return
    update((draft) => {
      const target = draft.reviews.find((item) => item.id === review.id)
      const finding = target?.findings.find((item) => item.id === findingId)
      if (finding) finding.status = finding.status === 'open' ? 'resolved' : 'open'
    })
  }

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(''), 1600)
    } catch {
      setError('The browser blocked clipboard access. Select the question text to copy it.')
    }
  }

  const copyQuestionBrief = () => {
    if (!review) return
    const open = review.findings.filter((finding) => finding.status === 'open')
    const brief = [
      `Questions for ${review.name}`,
      '',
      ...open.flatMap((finding, index) => [
        `${index + 1}. ${finding.title}`,
        `Ask: ${finding.question}`,
        finding.source ? `Source: ${sourceLabel(finding.source)}` : 'Source: topic not located in extracted text',
        finding.note ? `Note: ${finding.note}` : '',
        '',
      ]),
      'Generated by Solar Plainly. Verify every item against the complete agreement.',
    ].filter(Boolean).join('\n')
    void copyText('all', brief)
  }

  const deleteReview = () => {
    if (!review || !window.confirm(`Delete the review of "${review.name}"?`)) return
    update((draft) => {
      draft.reviews = draft.reviews.filter((item) => item.id !== review.id)
    })
    setAdding(data.reviews.length <= 1)
  }

  const carryDealToRecord = () => {
    if (!review) return
    update((draft) => {
      if (review.deal.ownership !== 'unknown') draft.profile.ownership = review.deal.ownership
      if (review.deal.systemSizeKw) draft.profile.systemSizeKw = review.deal.systemSizeKw
      if (review.deal.annualProductionKwh) draft.profile.expectedAnnualKwh = review.deal.annualProductionKwh
      if (review.deal.installer) draft.profile.installer = review.deal.installer
    })
    onNavigate('record')
  }

  if (adding || !review) {
    return (
      <div className="page-stack contract-empty">
        <section className="upload-intro">
          <div>
            <p className="eyebrow">Local contract desk</p>
            <h2>Review the whole packet, not one sales page.</h2>
            <p>
              Bring the proposal, installation agreement, financing, disclosure, equipment schedule, and warranties together before comparing the deal.
            </p>
          </div>
          <div className="privacy-facts">
            <span><Check size={16} /> No account</span>
            <span><Check size={16} /> No cloud upload</span>
            <span><Check size={16} /> Document and page sources</span>
          </div>
        </section>

        <div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
          <div className="drop-zone-icon"><Files size={24} /></div>
          <h3>{processing ? 'Reading the packet...' : 'Drop the solar packet here'}</h3>
          <p>Up to 8 searchable PDF or text files, 40 MB total, and 250 text pages.</p>
          <button className="primary-button" disabled={processing} onClick={() => fileRef.current?.click()} type="button">
            <Upload size={17} /> Choose documents
          </button>
          <input
            accept="application/pdf,text/plain,.pdf,.txt"
            hidden
            multiple
            onChange={(event) => void processFiles(Array.from(event.target.files ?? []))}
            ref={fileRef}
            type="file"
          />
        </div>

        <section className="paste-section">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">No files handy</p>
              <h2>Paste contract text</h2>
            </div>
            <button className="text-button" onClick={() => createReview('Fictional three-document sample', sampleContractPages)} type="button">
              <SearchCheck size={17} /> Load the complete sample
            </button>
          </div>
          <textarea aria-label="Contract text" onChange={(event) => setManualText(event.target.value)} placeholder="Paste the agreement text here..." rows={8} value={manualText} />
          <button className="secondary-button" onClick={analyzePastedText} type="button"><FileText size={17} /> Build the review</button>
        </section>

        {error && <div className="inline-alert error" role="alert"><AlertTriangle size={18} />{error}</div>}
        {data.reviews.length > 0 && <button className="text-button back-to-review" onClick={() => setAdding(false)} type="button">Back to saved reviews</button>}
        <p className="legal-note">Educational software only. It can miss language and cannot determine whether an agreement is lawful, complete, affordable, or right for you.</p>
      </div>
    )
  }

  const openCount = review.findings.filter((finding) => finding.status === 'open').length
  const importantOpen = review.findings.filter((finding) => finding.status === 'open' && finding.severity === 'important').length
  const resolvedCount = review.findings.length - openCount
  const packetGaps = review.packet.filter((item) => item.status === 'missing' || item.status === 'unknown').length
  const missingTerms = missingDealTerms(review.deal)
  const documents = new Set(review.pages.map((page) => page.documentName ?? review.name)).size

  const statusTitle = missingTerms.length
    ? `${missingTerms.length} core numbers missing`
    : importantOpen
      ? `${importantOpen} high-stakes questions open`
      : packetGaps
        ? `${packetGaps} packet items unconfirmed`
        : 'Comparison brief assembled'

  return (
    <div className="page-stack review-page">
      <section className="review-toolbar">
        <div>
          <p className="eyebrow">Reviewed {formatImportedAt(review.importedAt)}</p>
          <h2>{review.name}</h2>
          <p>{documents} {documents === 1 ? 'document' : 'documents'} / {review.pages.length} text pages</p>
        </div>
        <div className="toolbar-actions">
          {data.reviews.length > 1 && (
            <select aria-label="Saved contract review" onChange={(event) => setSelectedId(event.target.value)} value={review.id}>
              {data.reviews.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          )}
          <button className="secondary-button" onClick={copyQuestionBrief} type="button"><Clipboard size={17} /> {copiedId === 'all' ? 'Copied' : 'Copy questions'}</button>
          <button className="secondary-button" onClick={() => window.print()} type="button"><Printer size={17} /> Print / PDF</button>
          <button className="secondary-button" onClick={() => setAdding(true)} type="button"><Plus size={17} /> New review</button>
          <button aria-label="Delete review" className="icon-button danger" onClick={deleteReview} title="Delete review" type="button"><Trash2 size={18} /></button>
        </div>
      </section>

      <section className={`decision-banner ${missingTerms.length || importantOpen ? 'attention' : 'progress'}`}>
        <div>
          <p className="eyebrow">Homeowner brief</p>
          <h3>{statusTitle}</h3>
          <p>{missingTerms.length ? 'The offer cannot be compared cleanly yet.' : 'Use the sourced questions and packet gaps before making a decision.'} Solar Plainly never labels a contract safe to sign.</p>
        </div>
        <div className="decision-counts">
          <div><strong>{importantOpen}</strong><span>high-stakes</span></div>
          <div><strong>{openCount}</strong><span>open questions</span></div>
          <div><strong>{packetGaps}</strong><span>packet gaps</span></div>
        </div>
      </section>

      <nav className="review-tabs" aria-label="Contract review sections">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')} type="button">Deal</button>
        <button className={activeTab === 'questions' ? 'active' : ''} onClick={() => setActiveTab('questions')} type="button">Questions <span>{openCount}</span></button>
        <button className={activeTab === 'packet' ? 'active' : ''} onClick={() => setActiveTab('packet')} type="button">Packet <span>{packetGaps}</span></button>
      </nav>

      {activeTab === 'overview' && (
        <>
          <DealWorkspace onCarryToRecord={carryDealToRecord} review={review} update={update} />
          <section className="obligation-section" aria-labelledby="obligations-title">
            <div className="section-heading compact">
              <div><p className="eyebrow">Binding terms</p><h3 id="obligations-title">What could change the decision</h3></div>
              <button className="text-button" onClick={() => setActiveTab('questions')} type="button">Review all questions</button>
            </div>
            <div className="obligation-list">
              {review.findings.filter((finding) => finding.status === 'open').slice(0, 5).map((finding) => {
                const ObligationIcon = severityMeta[finding.severity].icon
                return (
                  <button key={finding.id} onClick={() => setActiveTab('questions')} type="button">
                    <span className={finding.severity}><ObligationIcon size={17} /></span>
                    <span><small>{finding.category}</small><strong>{finding.title}</strong><em>{finding.source ? sourceLabel(finding.source) : 'Topic not located'}</em></span>
                  </button>
                )
              })}
            </div>
          </section>
        </>
      )}

      {activeTab === 'questions' && (
        <section aria-labelledby="questions-title">
          <div className="section-heading">
            <div><p className="eyebrow">Sourced follow-up</p><h2 id="questions-title">Questions to resolve</h2><span>{resolvedCount} resolved</span></div>
            <div className="segmented-control" aria-label="Finding status filter">
              {(['open', 'resolved', 'all'] as const).map((option) => (
                <button aria-pressed={filter === option} className={filter === option ? 'active' : ''} key={option} onClick={() => setFilter(option)} type="button">{option[0].toUpperCase() + option.slice(1)}</button>
              ))}
            </div>
          </div>

          {findings.length === 0 ? (
            <div className="empty-message"><CheckCircle2 size={24} /><h3>No questions in this view</h3><p>Change the filter to see resolved items or the complete review.</p></div>
          ) : (
            <div className="finding-list compact-findings">
              {findings.map((finding) => {
                const meta = severityMeta[finding.severity]
                const SeverityIcon = meta.icon
                return (
                  <article className={`finding-row ${finding.severity} ${finding.status}`} key={finding.id}>
                    <div className="finding-row-heading">
                      <div>
                        <span className={`severity-label ${finding.severity}`}><SeverityIcon size={15} />{meta.label}</span>
                        <small>{finding.category}</small>
                        <h3>{finding.title}</h3>
                      </div>
                      <button className="resolve-button" onClick={() => toggleFinding(finding.id)} type="button">
                        {finding.status === 'open' ? <Check size={17} /> : <RotateCcw size={17} />}
                        {finding.status === 'open' ? 'Resolve' : 'Reopen'}
                      </button>
                    </div>
                    <p>{finding.explanation}</p>
                    <div className="question-block">
                      <span>Ask this</span><p>{finding.question}</p>
                      <button aria-label="Copy question" className="icon-button" onClick={() => void copyText(finding.id, finding.question)} title="Copy question" type="button">{copiedId === finding.id ? <Check size={17} /> : <Clipboard size={17} />}</button>
                    </div>
                    <details className="finding-evidence">
                      <summary>{finding.source ? `Source: ${sourceLabel(finding.source)}` : 'No matching source located'} / note</summary>
                      {finding.source && <blockquote>"{finding.source.excerpt}"</blockquote>}
                      <label className="finding-note">Your note
                        <textarea
                          onChange={(event) => {
                            const value = event.target.value
                            update((draft) => {
                              const target = draft.reviews.find((item) => item.id === review.id)?.findings.find((item) => item.id === finding.id)
                              if (target) target.note = value
                            })
                          }}
                          placeholder="What did the installer or lender say?"
                          rows={2}
                          value={finding.note ?? ''}
                        />
                      </label>
                    </details>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === 'packet' && <PacketChecklist review={review} update={update} />}

      {activeTab === 'questions' && (
        <details className="coverage-details">
          <summary>Text-review coverage</summary>
          <p>"Not found" means the checker did not locate familiar wording. It is not proof that the topic is absent.</p>
          <div className="coverage-list">
            {review.coverage.map((item) => (
              <div key={item.id}>
                {item.found ? <CheckCircle2 className="coverage-found" size={18} /> : <AlertTriangle className="coverage-missing" size={18} />}
                <span><strong>{item.label}</strong><small>{item.guidance}</small></span>
                <em>{item.found ? 'Located' : 'Not found'}</em>
              </div>
            ))}
          </div>
        </details>
      )}

      {error && <div className="inline-alert error" role="alert"><AlertTriangle size={18} />{error}</div>}
      <p className="legal-note">Solar Plainly uses deterministic text patterns and can miss context, attachments, handwriting, and scans. Verify every item against the complete agreement and qualified independent advice.</p>
      <ReviewReport review={review} />
    </div>
  )
}
