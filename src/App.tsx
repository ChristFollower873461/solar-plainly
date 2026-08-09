import { lazy, Suspense, useState } from 'react'
import { AppShell } from './components/AppShell'
import { Dashboard } from './components/Dashboard'
import { useSolarData } from './hooks/useSolarData'
import type { AppView, ReviewTab } from './types'

const ContractReview = lazy(() =>
  import('./components/ContractReview').then((module) => ({ default: module.ContractReview })),
)
const SystemPassport = lazy(() =>
  import('./components/SystemPassport').then((module) => ({ default: module.SystemPassport })),
)
const Care = lazy(() =>
  import('./components/Care').then((module) => ({ default: module.Care })),
)
const SettingsPage = lazy(() =>
  import('./components/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)

function App() {
  const [view, setView] = useState<AppView>('home')
  const [reviewTab, setReviewTab] = useState<ReviewTab>('overview')
  const { data, ready, saveState, update, replace, reset } = useSolarData()

  const navigate = (nextView: AppView) => {
    if (nextView === 'check') setReviewTab('overview')
    setView(nextView)
  }

  const openReview = (tab: ReviewTab) => {
    setReviewTab(tab)
    setView('check')
  }

  if (!ready) {
    return (
      <main className="loading-screen">
        <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" />
        <h1>Solar Plainly</h1>
        <p>Opening your local record...</p>
      </main>
    )
  }

  return (
    <AppShell onViewChange={navigate} saveState={saveState} view={view}>
      <Suspense fallback={<div className="view-loading">Opening...</div>}>
        {view === 'home' && <Dashboard data={data} onNavigate={navigate} onOpenReview={openReview} />}
        {view === 'check' && <ContractReview data={data} initialTab={reviewTab} onNavigate={navigate} update={update} />}
        {view === 'record' && <SystemPassport data={data} update={update} />}
        {view === 'care' && <Care data={data} update={update} />}
        {view === 'settings' && <SettingsPage data={data} onReplace={replace} onReset={reset} />}
      </Suspense>
    </AppShell>
  )
}

export default App
