import {
  ArrowRight,
  FileSearch,
  Files,
  Gauge,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { missingDealTerms } from '../lib/deal'
import type { AppView, ReviewTab, SolarData } from '../types'

interface DashboardProps {
  data: SolarData
  onNavigate: (view: AppView) => void
  onOpenReview: (tab: ReviewTab) => void
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${date}T12:00:00`),
  )

export function Dashboard({ data, onNavigate, onOpenReview }: DashboardProps) {
  const latestReview = data.reviews[0]
  const openFindings = latestReview?.findings.filter((finding) => finding.status === 'open').length ?? 0
  const importantFindings = latestReview?.findings.filter((finding) => finding.status === 'open' && finding.severity === 'important').length ?? 0
  const missingTerms = latestReview ? missingDealTerms(latestReview.deal).length : 0
  const packetGaps = latestReview?.packet.filter((item) => item.status === 'missing' || item.status === 'unknown').length ?? 0
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
        action: () => onOpenReview('overview'),
        icon: FileSearch,
      }
    : missingTerms > 0
      ? {
          eyebrow: `${missingTerms} missing deal ${missingTerms === 1 ? 'number' : 'numbers'}`,
          title: 'Make the offer comparable',
          detail: 'Capture the cash price, complete financing, payment changes, system size, and production assumptions.',
          label: 'Open deal desk',
          action: () => onOpenReview('overview'),
          icon: Gauge,
        }
      : openFindings > 0
      ? {
          eyebrow: `${importantFindings} high-stakes / ${openFindings} total`,
          title: 'Take the unresolved terms back',
          detail: 'Get written answers from the installer, lender, or an independent professional.',
          label: 'Open questions',
          action: () => onOpenReview('questions'),
          icon: FileSearch,
        }
      : packetGaps > 0
        ? {
            eyebrow: `${packetGaps} unconfirmed packet ${packetGaps === 1 ? 'item' : 'items'}`,
            title: 'Make sure the paperwork is complete',
            detail: 'A proposal, installation contract, financing agreement, and disclosure can contain different promises.',
            label: 'Check the packet',
            action: () => onOpenReview('packet'),
            icon: Files,
          }
      : recordPercent < 75
        ? {
            eyebrow: 'After installation',
            title: 'Complete the system record',
            detail: 'Keep the equipment, warranty, utility, and installer details together.',
            label: 'Build the record',
            action: () => onNavigate('record'),
            icon: ShieldCheck,
          }
        : {
            eyebrow: nextTask ? `Due ${formatDate(nextTask.dueDate)}` : 'System care',
            title: nextTask?.title ?? 'Add the next maintenance check',
            detail: 'Small, documented checks make warranty claims and troubleshooting easier.',
            label: 'Open care list',
            action: () => onNavigate('care'),
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
        <button className="primary-button" onClick={nextAction.action} type="button">
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
          <button className="summary-panel" onClick={() => onOpenReview('overview')} type="button">
            <Gauge size={21} />
            <span className="summary-value">{latestReview ? missingTerms : '-'}</span>
            <strong>Deal numbers missing</strong>
            <small>{latestReview ? 'Before this offer can be compared' : 'No contract packet reviewed'}</small>
          </button>
          <button className="summary-panel" onClick={() => onOpenReview('questions')} type="button">
            <FileSearch size={21} />
            <span className="summary-value">{latestReview ? openFindings : '-'}</span>
            <strong>Unresolved contract questions</strong>
            <small>{latestReview ? `${importantFindings} need an answer` : 'Sources stay linked to each question'}</small>
          </button>
          <button className="summary-panel" onClick={() => onOpenReview('packet')} type="button">
            <Files size={21} />
            <span className="summary-value">{latestReview ? packetGaps : '-'}</span>
            <strong>Packet items unconfirmed</strong>
            <small>{latestReview?.name ?? 'Installation, financing, disclosure, warranties'}</small>
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
          <strong>Arithmetic you can inspect</strong>
          <p>Every comparison shows its inputs and limits instead of hiding behind a savings score.</p>
        </div>
      </section>
    </div>
  )
}
