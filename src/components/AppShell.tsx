import {
  ClipboardCheck,
  FileSearch,
  House,
  Settings,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { AppView } from '../types'

interface AppShellProps {
  view: AppView
  onViewChange: (view: AppView) => void
  saveState: 'saved' | 'saving' | 'error'
  children: ReactNode
}

const navItems = [
  { id: 'home' as const, label: 'Home', icon: House },
  { id: 'check' as const, label: 'Check', icon: FileSearch },
  { id: 'record' as const, label: 'Record', icon: ClipboardCheck },
  { id: 'care' as const, label: 'Care', icon: Wrench },
]

const viewTitles: Record<AppView, string> = {
  home: 'Home',
  check: 'Contract check',
  record: 'System record',
  care: 'System care',
  settings: 'Data and settings',
}

export function AppShell({ view, onViewChange, saveState, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <button className="brand" onClick={() => onViewChange('home')} type="button">
          <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" />
          <span>
            <strong>Solar Plainly</strong>
            <small>Private by default</small>
          </span>
        </button>

        <nav className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                className={view === item.id ? 'nav-button active' : 'nav-button'}
                key={item.id}
                onClick={() => onViewChange(item.id)}
                type="button"
              >
                <Icon size={19} strokeWidth={1.8} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="privacy-note">
            <ShieldCheck size={17} aria-hidden="true" />
            <span>Stored on this device</span>
          </div>
          <button
            className={view === 'settings' ? 'nav-button active' : 'nav-button'}
            onClick={() => onViewChange('settings')}
            type="button"
          >
            <Settings size={19} strokeWidth={1.8} />
            Settings
          </button>
        </div>
      </aside>

      <main className="main-column">
        <header className="topbar">
          <div>
            <div className="mobile-brand">Solar Plainly</div>
            <h1>{viewTitles[view]}</h1>
          </div>
          <div className={`save-state ${saveState}`} role="status" aria-live="polite">
            <span aria-hidden="true" />
            {saveState === 'saved' ? 'Saved here' : saveState === 'saving' ? 'Saving' : 'Save error'}
          </div>
          <button
            aria-label="Open settings"
            className="icon-button mobile-settings"
            onClick={() => onViewChange('settings')}
            title="Settings"
            type="button"
          >
            <Settings size={20} />
          </button>
        </header>
        <div className="page-content">{children}</div>
      </main>

      <nav className="mobile-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              className={view === item.id ? 'active' : ''}
              key={item.id}
              onClick={() => onViewChange(item.id)}
              type="button"
            >
              <Icon size={20} strokeWidth={1.9} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
