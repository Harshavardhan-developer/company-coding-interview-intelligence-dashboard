import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Building2, ListChecks, Repeat, Users, Shapes, GitCompare, Grid3x3, Gauge, Clock, Target, ShieldCheck, BookOpen, Menu, X } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { ThemeToggle } from '../common/Controls'
import GlobalSearch from './GlobalSearch'

const NAV = [
  ['/', 'Dashboard', LayoutDashboard], ['/companies', 'Companies', Building2], ['/questions', 'Questions', ListChecks],
  ['/repeated', 'Most Repeated', Repeat], ['/common', 'Common Questions', Users], ['/topics', 'Topics', Shapes],
  ['/compare', 'Comparison & Overlap', GitCompare], ['/matrices', 'Matrices', Grid3x3], ['/difficulty', 'Difficulty & Acceptance', Gauge],
  ['/recency', 'Recency', Clock], ['/preparation', 'Preparation', Target], ['/data-quality', 'Data Quality', ShieldCheck], ['/methodology', 'Methodology', BookOpen],
]

function Nav({ onNavigate }) {
  return (
    <nav aria-label="Main" className="space-y-0.5">
      {NAV.map(([to, label, Icon]) => (
        <NavLink key={to} to={to} end={to === '/'} onClick={onNavigate}
          className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-indigo-500/15 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
          <Icon className="h-4 w-4" aria-hidden />{label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Layout({ children }) {
  const [theme, toggleTheme] = useTheme()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])
  const brand = <div className="flex items-center gap-2 px-3 py-4 font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-xs text-white">II</span>Interview Intelligence</div>
  return (
    <div className="min-h-screen lg:pl-60">
      <aside className="fixed inset-y-0 left-0 hidden w-60 overflow-y-auto border-r border-slate-200 bg-white px-2 dark:border-slate-800 dark:bg-slate-900 lg:block">{brand}<Nav /></aside>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <button className="btn px-2 lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        <div className="flex-1"><GlobalSearch /></div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>
      {open && <div className="border-b border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 lg:hidden"><Nav onNavigate={() => setOpen(false)} /></div>}
      <main className="mx-auto max-w-[1400px] p-4 sm:p-6">{children}</main>
    </div>
  )
}
