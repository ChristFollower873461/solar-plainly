import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  FileText,
  Info,
  Plus,
  RotateCcw,
  SearchCheck,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { sampleContractPages } from '../data/defaults'
import { analyzeContractPages } from '../lib/contractAnalyzer'
import { readContractFile } from '../lib/pdf'
import type {
  ContractPage,
  FindingSeverity,
  SolarData,
  UpdateSolarData,
} from '../types'

interface ContractReviewProps {
  data: SolarData
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

export function ContractReview({ data, update }: ContractReviewProps) {
  const [selectedId, setSelectedId] = useState(data.reviews[0]?.id ?? '')
  const [adding, setAdding] = useState(data.reviews.length === 0)
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
    const id = crypto.randomUUID()
    update((draft) => {
      draft.reviews.unshift({
        id,
        name,
        importedAt: new Date().toISOString(),
        pages,
        ...analysis,
      })
    })
    setSelectedId(id)
    setAdding(false)
    setFilter('open')
  }

  const processFile = async (file?: File) => {
    if (!file) return
    setError('')
    setProcessing(true)
    try {
      createReview(file.name, await readContractFile(file))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The contract could not be read.')
    } finally {
      setProcessing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    void processFile(event.dataTransfer.files[0])
  }

  const analyzePastedText = () => {
    const text = manualText.trim()
    if (text.length < 80) {
      setError('Paste at least a few paragraphs so the check has enough context.')
      return
    }
    createReview('Pasted contract text', [{ number: 1, text }])
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

  const copyQuestion = async (findingId: string, question: string) => {
    try {
      await navigator.clipboard.writeText(question)
      setCopiedId(findingId)
      window.setTimeout(() => setCopiedId(''), 1600)
    } catch {
      setError('The browser blocked clipboard access. Select the question text to copy it.')
    }
  }

  const deleteReview = () => {
    if (!review || !window.confirm(`Delete the review of "${review.name}"?`)) return
    update((draft) => {
      draft.reviews = draft.reviews.filter((item) => item.id !== review.id)
    })
    setAdding(data.reviews.length <= 1)
  }

  if (adding || !review) {
    return (
      <div className="page-stack contract-empty">
        <section className="upload-intro">
          <div>
            <p className="eyebrow">Local contract check</p>
            <h2>Bring the agreement, not your identity.</h2>
            <p>
              Solar Plainly reads searchable PDF text inside this browser and turns selected terms into questions to resolve.
            </p>
          </div>
          <div className="privacy-facts">
            <span><Check size={16} /> No account</span>
            <span><Check size={16} /> No upload</span>
            <span><Check size={16} /> Page-linked findings</span>
          </div>
        </section>

        <div
          className="drop-zone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
        >
          <div className="drop-zone-icon"><Upload size={24} /></div>
          <h3>{processing ? 'Reading the contract...' : 'Drop a PDF or text file here'}</h3>
          <p>Searchable PDFs work best. Maximum 15 MB and 150 pages.</p>
          <button
            className="primary-button"
            disabled={processing}
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            <Upload size={17} />
            Choose file
          </button>
          <input
            accept="application/pdf,text/plain,.pdf,.txt"
            hidden
            onChange={(event) => void processFile(event.target.files?.[0])}
            ref={fileRef}
            type="file"
          />
        </div>

        <section className="paste-section">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Another way</p>
              <h2>Paste contract text</h2>
            </div>
            <button
              className="text-button"
              onClick={() => createReview('Fictional sample agreement', sampleContractPages)}
              type="button"
            >
              <SearchCheck size={17} />
              Load the sample
            </button>
          </div>
          <textarea
            aria-label="Contract text"
            onChange={(event) => setManualText(event.target.value)}
            placeholder="Paste the agreement text here..."
            rows={8}
            value={manualText}
          />
          <button className="secondary-button" onClick={analyzePastedText} type="button">
            <FileText size={17} />
            Check pasted text
          </button>
        </section>

        {error && <div className="inline-alert error" role="alert"><AlertTriangle size={18} />{error}</div>}
        {data.reviews.length > 0 && (
          <button className="text-button back-to-review" onClick={() => setAdding(false)} type="button">
            Back to saved reviews
          </button>
        )}

        <p className="legal-note">
          This is educational software, not legal, tax, financial, engineering, or warranty advice. It can miss language and cannot determine whether an agreement is lawful or right for you.
        </p>
      </div>
    )
  }

  const openCount = review.findings.filter((finding) => finding.status === 'open').length
  const resolvedCount = review.findings.length - openCount

  return (
    <div className="page-stack review-page">
      <section className="review-toolbar">
        <div>
          <p className="eyebrow">Reviewed {formatImportedAt(review.importedAt)}</p>
          <h2>{review.name}</h2>
          <p>{review.pages.length} {review.pages.length === 1 ? 'page' : 'pages'} / {openCount} open questions</p>
        </div>
        <div className="toolbar-actions">
          {data.reviews.length > 1 && (
            <select
              aria-label="Saved contract review"
              onChange={(event) => setSelectedId(event.target.value)}
              value={review.id}
            >
              {data.reviews.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          )}
          <button className="secondary-button" onClick={() => setAdding(true)} type="button">
            <Plus size={17} /> New check
          </button>
          <button aria-label="Delete review" className="icon-button danger" onClick={deleteReview} title="Delete review" type="button">
            <Trash2 size={18} />
          </button>
        </div>
      </section>

      <div className="review-summary">
        <div><strong>{openCount}</strong><span>Open questions</span></div>
        <div><strong>{resolvedCount}</strong><span>Resolved</span></div>
        <div><strong>{review.facts.length}</strong><span>Possible terms found</span></div>
        <div><strong>{review.coverage.filter((item) => item.found).length}/{review.coverage.length}</strong><span>Topics located</span></div>
      </div>

      {review.facts.length > 0 && (
        <section aria-labelledby="possible-terms-title">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Verify against the document</p>
              <h2 id="possible-terms-title">Possible key terms</h2>
            </div>
          </div>
          <div className="fact-strip">
            {review.facts.map((fact) => (
              <div key={fact.id} title={`Page ${fact.source.page}: ${fact.source.excerpt}`}>
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
                <small>Page {fact.source.page}</small>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="questions-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Review queue</p>
            <h2 id="questions-title">Questions to resolve</h2>
          </div>
          <div className="segmented-control" aria-label="Finding status filter">
            {(['open', 'resolved', 'all'] as const).map((option) => (
              <button
                aria-pressed={filter === option}
                className={filter === option ? 'active' : ''}
                key={option}
                onClick={() => setFilter(option)}
                type="button"
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {findings.length === 0 ? (
          <div className="empty-message">
            <CheckCircle2 size={24} />
            <h3>No questions in this view</h3>
            <p>Change the filter to see resolved items or the complete review.</p>
          </div>
        ) : (
          <div className="finding-list">
            {findings.map((finding) => {
              const meta = severityMeta[finding.severity]
              const SeverityIcon = meta.icon
              return (
                <article className={`finding-item ${finding.severity} ${finding.status}`} key={finding.id}>
                  <div className="finding-main">
                    <div className={`severity-label ${finding.severity}`}>
                      <SeverityIcon size={15} />
                      {meta.label}
                    </div>
                    <p className="finding-category">{finding.category}</p>
                    <h3>{finding.title}</h3>
                    <p>{finding.explanation}</p>
                    <div className="question-block">
                      <span>Ask this</span>
                      <p>{finding.question}</p>
                      <button
                        aria-label="Copy question"
                        className="icon-button"
                        onClick={() => void copyQuestion(finding.id, finding.question)}
                        title="Copy question"
                        type="button"
                      >
                        {copiedId === finding.id ? <Check size={17} /> : <Clipboard size={17} />}
                      </button>
                    </div>
                    {finding.source && (
                      <blockquote>
                        <span>Page {finding.source.page}</span>
                        "{finding.source.excerpt}"
                      </blockquote>
                    )}
                    <label className="finding-note">
                      Your note
                      <textarea
                        onChange={(event) => {
                          const value = event.target.value
                          update((draft) => {
                            const target = draft.reviews
                              .find((item) => item.id === review.id)
                              ?.findings.find((item) => item.id === finding.id)
                            if (target) target.note = value
                          })
                        }}
                        placeholder="What did the installer or lender say?"
                        rows={2}
                        value={finding.note ?? ''}
                      />
                    </label>
                  </div>
                  <button className="resolve-button" onClick={() => toggleFinding(finding.id)} type="button">
                    {finding.status === 'open' ? <Check size={17} /> : <RotateCcw size={17} />}
                    {finding.status === 'open' ? 'Mark resolved' : 'Reopen'}
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <details className="coverage-details">
        <summary>Review coverage</summary>
        <p>"Not found" means the text checker did not locate familiar wording. It is not proof that the topic is absent.</p>
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

      {error && <div className="inline-alert error" role="alert"><AlertTriangle size={18} />{error}</div>}
      <p className="legal-note">
        Solar Plainly uses deterministic text patterns and can miss context, attachments, handwritten changes, and scanned pages. Verify every item against the complete agreement and qualified independent advice.
      </p>
    </div>
  )
}
