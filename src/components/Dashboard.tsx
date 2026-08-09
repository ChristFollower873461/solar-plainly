import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Gauge,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import type { AppView, SolarData } from '../types'

interface DashboardProps {
  data: SolarData
  onNavigate: (view: AppView) => void
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${date}T12:00:00`),
  )

export function Dashboard({ data, onNavigate }: DashboardProps) {
  const latestReview = data.reviews[0]
  const openFindings = latestReview?.findings.filter((finding) => finding.status === 'open').length ?? 0
  const nextTask = [...data.tasks]
    .filter((task) => !task.completedAt)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
  const profileFields = [
    data.profile.systemSizeKw,
    data.profile.installer,
    data.profile.utility,
    data.profile.permissionToOperateDate,
  ]
  const profileComplete = profileFields.filter(Boolean).length
  const recordPercent = Math.round(
    ((profileComplete + Math.min(data.equipment.length, 2) + Math.min(data.documents.length, 2)) / 8) * 100,
  )

  const nextAction = !latestReview
    ? {
        eyebrow: 'Before you sign',
        title: 'Check the agreement in front of you',
        detail: 'Upload a PDF or paste the text. The file never leaves this browser.',
        label: 'Check a contract',
        view: 'check' as const,
        icon: FileSearch,
      }
    : openFindings > 0
      ? {
          eyebrow: `${openFindings} open ${openFindings === 1 ? 'question' : 'questions'}`,
          title: 'Finish your contract review',
          detail: 'Resolve each question with the installer, lender, or an independent professional.',
          label: 'Open review',
          view: 'check' as const,
          icon: FileSearch,
        }
      : recordPercent < 75
        ? {
            eyebrow: 'After installation',
            title: 'Complete the system record',
            detail: 'Keep the equipment, warranty, utility, and installer details together.',
            label: 'Build the record',
            view: 'record' as const,
            icon: ShieldCheck,
          }
        : {
            eyebrow: nextTask ? `Due ${formatDate(nextTask.dueDate)}` : 'System care',
            title: nextTask?.title ?? 'Add the next maintenance check',
            detail: 'Small, documented checks make warranty claims and troubleshooting easier.',
            label: 'Open care list',
            view: 'care' as const,
            icon: Wrench,
          }

  const NextIcon = nextAction.icon

  return (
    <div className="dashboard page-stack">
      <section className="welcome-band">
        <div>
          <p className="eyebrow">{data.profile.nickname || 'Your home solar record'}</p>
          <h2>Your solar, without the sales fog.</h2>
          <p>
            Keep the questions, documents, equipment, and care history that belong to you.
          </p>
        </div>
        <div className="local-seal" aria-label="Your information stays on this device">
          <ShieldCheck size={28} />
          <span>
            <strong>On-device</strong>
            <small>No account or cloud upload</small>
          </span>
        </div>
      </section>

      <section className="next-action" aria-labelledby="next-action-title">
        <div className="next-action-icon" aria-hidden="true">
          <NextIcon size={24} />
        </div>
        <div>
          <p className="eyebrow">{nextAction.eyebrow}</p>
          <h2 id="next-action-title">{nextAction.title}</h2>
          <p>{nextAction.detail}</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate(nextAction.view)} type="button">
          {nextAction.label}
          <ArrowRight size={17} />
        </button>
      </section>

      <section aria-labelledby="at-a-glance-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">At a glance</p>
            <h2 id="at-a-glance-title">What needs your attention</h2>
          </div>
        </div>
        <div className="summary-grid">
          <button className="summary-panel" onClick={() => onNavigate('check')} type="button">
            <FileSearch size={21} />
            <span className="summary-value">{latestReview ? openFindings : '-'}</span>
            <strong>Contract questions</strong>
            <small>{latestReview?.name ?? 'No contract checked yet'}</small>
          </button>
          <button className="summary-panel" onClick={() => onNavigate('record')} type="button">
            <Gauge size={21} />
            <span className="summary-value">{recordPercent}%</span>
            <strong>Record complete</strong>
            <small>{data.equipment.length} equipment / {data.documents.length} documents</small>
          </button>
          <button className="summary-panel" onClick={() => onNavigate('care')} type="button">
            <CheckCircle2 size={21} />
            <span className="summary-value">{data.tasks.filter((task) => !task.completedAt).length}</span>
            <strong>Open care tasks</strong>
            <small>{nextTask ? `Next due ${formatDate(nextTask.dueDate)}` : 'Nothing due'}</small>
          </button>
        </div>
      </section>

      <section className="principles-band" aria-label="Solar Plainly operating principles">
        <div>
          <strong>Questions, not verdicts</strong>
          <p>Every flag is a prompt to confirm, not a claim that a contract is good or bad.</p>
        </div>
        <div>
          <strong>Sources, not mystery scores</strong>
          <p>Findings point back to the page and wording that triggered them.</p>
        </div>
        <div>
          <strong>Your record, your file</strong>
          <p>Export a portable backup at any time and erase the browser copy in one place.</p>
        </div>
      </section>
    </div>
  )
}
