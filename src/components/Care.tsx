import {
  AlertTriangle,
  CalendarCheck,
  Check,
  CircleDot,
  ClipboardPlus,
  FileSpreadsheet,
  Plus,
  Trash2,
  TrendingDown,
  Upload,
  X,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { calculateAnnualComparison, nextDueDate } from '../lib/production'
import { readProductionCsv } from '../lib/productionImport'
import type {
  IssueStatus,
  ProductionEntry,
  SolarData,
  TaskFrequency,
  UpdateSolarData,
} from '../types'

interface CareProps {
  data: SolarData
  update: UpdateSolarData
}

type CareTab = 'tasks' | 'production' | 'issues'

const today = () => new Date().toISOString().slice(0, 10)
const thisMonth = () => new Date().toISOString().slice(0, 7)

export function Care({ data, update }: CareProps) {
  const [tab, setTab] = useState<CareTab>('tasks')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDue, setTaskDue] = useState(today)
  const [taskFrequency, setTaskFrequency] = useState<TaskFrequency>('once')
  const [productionMonth, setProductionMonth] = useState(thisMonth)
  const [productionKwh, setProductionKwh] = useState('')
  const [productionNotes, setProductionNotes] = useState('')
  const [issueTitle, setIssueTitle] = useState('')
  const [issueContact, setIssueContact] = useState('')
  const [issueNotes, setIssueNotes] = useState('')
  const [importPreview, setImportPreview] = useState<ProductionEntry[]>([])
  const [importName, setImportName] = useState('')
  const [importError, setImportError] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  const tasks = useMemo(
    () => [...data.tasks].sort((a, b) => {
      if (Boolean(a.completedAt) !== Boolean(b.completedAt)) return a.completedAt ? 1 : -1
      return a.dueDate.localeCompare(b.dueDate)
    }),
    [data.tasks],
  )
  const chartData = useMemo(
    () => [...data.production].sort((a, b) => a.month.localeCompare(b.month)).slice(-36),
    [data.production],
  )
  const comparison = calculateAnnualComparison(data.production)

  const completeTask = (taskId: string) => {
    update((draft) => {
      const task = draft.tasks.find((item) => item.id === taskId)
      if (!task) return
      if (task.frequency === 'once') task.completedAt = new Date().toISOString()
      else {
        task.dueDate = nextDueDate(task.dueDate, task.frequency)
        task.completedAt = null
      }
    })
  }

  const addTask = () => {
    if (!taskTitle.trim()) return
    update((draft) => {
      draft.tasks.push({
        id: crypto.randomUUID(),
        title: taskTitle.trim(),
        dueDate: taskDue,
        frequency: taskFrequency,
        completedAt: null,
        notes: '',
      })
    })
    setTaskTitle('')
  }

  const addProduction = () => {
    const kwh = Number(productionKwh)
    if (!productionMonth || !Number.isFinite(kwh) || kwh < 0) return
    update((draft) => {
      draft.production = draft.production.filter((entry) => entry.month !== productionMonth)
      draft.production.push({
        id: crypto.randomUUID(),
        month: productionMonth,
        kwh,
        notes: productionNotes.trim(),
      })
    })
    setProductionKwh('')
    setProductionNotes('')
  }

  const addIssue = () => {
    if (!issueTitle.trim()) return
    update((draft) => {
      draft.issues.unshift({
        id: crypto.randomUUID(),
        title: issueTitle.trim(),
        openedAt: today(),
        status: 'watching',
        contact: issueContact.trim(),
        notes: issueNotes.trim(),
      })
    })
    setIssueTitle('')
    setIssueContact('')
    setIssueNotes('')
  }

  const previewProductionCsv = async (file?: File) => {
    if (!file) return
    setImportError('')
    try {
      setImportPreview(await readProductionCsv(file))
      setImportName(file.name)
    } catch (caught) {
      setImportPreview([])
      setImportName('')
      setImportError(caught instanceof Error ? caught.message : 'The production CSV could not be read.')
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  const confirmProductionImport = () => {
    if (!importPreview.length) return
    const importedMonths = new Set(importPreview.map((entry) => entry.month))
    update((draft) => {
      draft.production = [
        ...draft.production.filter((entry) => !importedMonths.has(entry.month)),
        ...importPreview,
      ]
    })
    setImportPreview([])
    setImportName('')
  }

  return (
    <div className="page-stack care-page">
      <section className="care-summary">
        <div>
          <p className="eyebrow">Ownership is the long part</p>
          <h2>Keep a quiet record of what happens next.</h2>
          <p>Track checks, monthly production, service conversations, and warranty work.</p>
        </div>
        <div className="care-stats">
          <span><strong>{data.tasks.filter((task) => !task.completedAt).length}</strong> Tasks</span>
          <span><strong>{data.production.length}</strong> Months</span>
          <span><strong>{data.issues.filter((issue) => issue.status !== 'resolved').length}</strong> Open issues</span>
        </div>
      </section>

      <div className="tab-bar" role="tablist" aria-label="Care sections">
        <button aria-selected={tab === 'tasks'} className={tab === 'tasks' ? 'active' : ''} onClick={() => setTab('tasks')} role="tab" type="button"><CalendarCheck size={18} /> Tasks</button>
        <button aria-selected={tab === 'production'} className={tab === 'production' ? 'active' : ''} onClick={() => setTab('production')} role="tab" type="button"><CircleDot size={18} /> Production</button>
        <button aria-selected={tab === 'issues'} className={tab === 'issues' ? 'active' : ''} onClick={() => setTab('issues')} role="tab" type="button"><ClipboardPlus size={18} /> Issues</button>
      </div>

      {tab === 'tasks' && (
        <section aria-labelledby="care-tasks-title">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Next checks</p>
              <h2 id="care-tasks-title">Care list</h2>
            </div>
          </div>
          <div className="quick-add task-add">
            <input aria-label="Task title" onChange={(event) => setTaskTitle(event.target.value)} placeholder="Add a care task" value={taskTitle} />
            <input aria-label="Due date" onChange={(event) => setTaskDue(event.target.value)} type="date" value={taskDue} />
            <select aria-label="Repeat frequency" onChange={(event) => setTaskFrequency(event.target.value as TaskFrequency)} value={taskFrequency}>
              <option value="once">Once</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="twice-yearly">Every 6 months</option>
              <option value="yearly">Yearly</option>
            </select>
            <button aria-label="Add task" className="icon-button primary-icon" onClick={addTask} title="Add task" type="button"><Plus size={19} /></button>
          </div>
          <div className="task-list">
            {tasks.map((task) => {
              const overdue = !task.completedAt && task.dueDate < today()
              return (
                <article className={task.completedAt ? 'task-item completed' : 'task-item'} key={task.id}>
                  <button
                    aria-label={task.completedAt ? 'Task completed' : `Complete ${task.title}`}
                    className="task-check"
                    disabled={Boolean(task.completedAt)}
                    onClick={() => completeTask(task.id)}
                    type="button"
                  >
                    {task.completedAt && <Check size={16} />}
                  </button>
                  <div>
                    <h3>{task.title}</h3>
                    <p className={overdue ? 'overdue' : ''}>{task.completedAt ? 'Completed' : `Due ${task.dueDate}`} / {task.frequency}</p>
                    {task.notes && <small>{task.notes}</small>}
                  </div>
                  <button aria-label={`Delete ${task.title}`} className="icon-button danger" onClick={() => update((draft) => { draft.tasks = draft.tasks.filter((item) => item.id !== task.id) })} title="Delete task" type="button"><Trash2 size={17} /></button>
                </article>
              )
            })}
          </div>
          <p className="legal-note">Use manufacturer instructions and qualified professionals for actual service. Do not climb on a roof or open electrical equipment based on this checklist.</p>
        </section>
      )}

      {tab === 'production' && (
        <section aria-labelledby="production-title">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Monthly log</p>
              <h2 id="production-title">Production</h2>
            </div>
            <div className="production-import-action">
              <button className="secondary-button" onClick={() => importRef.current?.click()} type="button"><Upload size={17} /> Import CSV</button>
              <input accept="text/csv,.csv" hidden onChange={(event) => void previewProductionCsv(event.target.files?.[0])} ref={importRef} type="file" />
            </div>
          </div>

          {importPreview.length > 0 && (
            <div className="production-import-preview">
              <FileSpreadsheet size={24} />
              <div>
                <strong>{importPreview.length} months ready from {importName}</strong>
                <p>{importPreview[0].month} through {importPreview.at(-1)?.month} / {importPreview.filter((entry) => data.production.some((current) => current.month === entry.month)).length} existing months will be replaced</p>
              </div>
              <button aria-label="Cancel CSV import" className="icon-button" onClick={() => { setImportPreview([]); setImportName('') }} title="Cancel import" type="button"><X size={17} /></button>
              <button className="primary-button" onClick={confirmProductionImport} type="button"><Check size={17} /> Import months</button>
            </div>
          )}

          {importError && <div className="inline-alert error" role="alert"><AlertTriangle size={18} />{importError}</div>}

          {comparison && comparison.changePercent <= -10 && (
            <div className="inline-alert warning">
              <TrendingDown size={20} />
              <span>
                <strong>Production is down {Math.abs(comparison.changePercent).toFixed(1)}% across the latest 12 recorded months.</strong>
                Weather, shade, outages, missing data, and system changes can also cause a drop. Check the monitoring portal and contact a qualified service provider if the pattern persists.
              </span>
            </div>
          )}

          <div className="production-chart" aria-label="Monthly production chart">
            {chartData.length === 0 ? (
              <div className="empty-chart"><CircleDot size={24} /><span>Add a monthly total to start the production history.</span></div>
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData} margin={{ top: 16, right: 18, bottom: 8, left: 0 }}>
                  <CartesianGrid stroke="#e5e8e5" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} stroke="#69716c" tickLine={false} />
                  <YAxis fontSize={12} stroke="#69716c" tickLine={false} width={48} />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} kWh`, 'Production']} />
                  <Line activeDot={{ r: 5 }} dataKey="kwh" dot={{ r: 3 }} stroke="#0b7443" strokeWidth={2.5} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="quick-add production-add">
            <label>Month<input onChange={(event) => setProductionMonth(event.target.value)} type="month" value={productionMonth} /></label>
            <label>Production (kWh)<input min="0" onChange={(event) => setProductionKwh(event.target.value)} placeholder="850" type="number" value={productionKwh} /></label>
            <label>Note<input onChange={(event) => setProductionNotes(event.target.value)} placeholder="Optional: outage, shade, weather" value={productionNotes} /></label>
            <button className="primary-button" onClick={addProduction} type="button"><Plus size={17} /> Save month</button>
          </div>

          {chartData.length > 0 && (
            <div className="production-table" role="table" aria-label="Production entries">
              {[...chartData].reverse().map((entry) => (
                <div role="row" key={entry.id}>
                  <span role="cell">{entry.month}</span>
                  <strong role="cell">{entry.kwh.toLocaleString()} kWh</strong>
                  <small role="cell">{entry.notes || 'No note'}</small>
                  <button aria-label={`Delete production for ${entry.month}`} className="icon-button danger" onClick={() => update((draft) => { draft.production = draft.production.filter((item) => item.id !== entry.id) })} title="Delete entry" type="button"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
          <p className="legal-note">Comparisons are arithmetic on the values you enter, not a weather-normalized performance diagnosis.</p>
        </section>
      )}

      {tab === 'issues' && (
        <section aria-labelledby="issues-title">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Service history</p>
              <h2 id="issues-title">Issues and claims</h2>
            </div>
          </div>
          <div className="inline-form issue-form">
            <label>What happened?<input onChange={(event) => setIssueTitle(event.target.value)} placeholder="Inverter alert, roof leak, lower output..." value={issueTitle} /></label>
            <label>Who did you contact?<input onChange={(event) => setIssueContact(event.target.value)} placeholder="Installer, manufacturer, electrician" value={issueContact} /></label>
            <label className="span-two">Notes<textarea onChange={(event) => setIssueNotes(event.target.value)} placeholder="Error code, ticket number, promise, next step" rows={3} value={issueNotes} /></label>
            <div className="inline-form-actions span-two"><button className="primary-button" onClick={addIssue} type="button"><Plus size={17} /> Add issue</button></div>
          </div>
          {data.issues.length === 0 ? (
            <div className="empty-message compact-empty"><ClipboardPlus size={23} /><h3>No issues recorded</h3><p>That is a good empty state. Add one when you need a service trail.</p></div>
          ) : (
            <div className="issue-list">
              {data.issues.map((issue) => (
                <article className="issue-item" key={issue.id}>
                  <AlertTriangle size={20} />
                  <div>
                    <h3>{issue.title}</h3>
                    <p>Opened {issue.openedAt}{issue.contact ? ` / Contact: ${issue.contact}` : ''}</p>
                    {issue.notes && <small>{issue.notes}</small>}
                  </div>
                  <select
                    aria-label={`Status for ${issue.title}`}
                    onChange={(event) => update((draft) => {
                      const target = draft.issues.find((item) => item.id === issue.id)
                      if (target) target.status = event.target.value as IssueStatus
                    })}
                    value={issue.status}
                  >
                    <option value="watching">Watching</option>
                    <option value="contacted">Contacted</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button aria-label={`Delete ${issue.title}`} className="icon-button danger" onClick={() => update((draft) => { draft.issues = draft.issues.filter((item) => item.id !== issue.id) })} title="Delete issue" type="button"><Trash2 size={17} /></button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
