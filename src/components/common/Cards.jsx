import { Info } from 'lucide-react'

export function StatCard({ label, value, hint, icon: Icon, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className={`card p-4 text-left ${onClick ? 'transition hover:border-brand-500' : ''}`}>
      <div className="flex items-center justify-between"><span className="muted">{label}</span>{Icon && <Icon className="h-4 w-4 text-slate-400" aria-hidden />}</div>
      <div className="mt-1.5 truncate text-2xl font-semibold tabular-nums" title={String(value)}>{value}</div>
      {hint && <div className="muted mt-0.5 truncate text-xs" title={hint}>{hint}</div>}
    </Tag>
  )
}

export function ChartCard({ title, subtitle, note, children, className = '', height = 300 }) {
  return (
    <section className={`card p-4 ${className}`} aria-label={title}>
      <h2 className="text-sm font-semibold">{title}</h2>
      {subtitle && <p className="muted text-xs">{subtitle}</p>}
      <div className="mt-3" style={{ height }}>{children}</div>
      {note && <p className="muted mt-2 flex gap-1.5 text-xs"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{note}</p>}
    </section>
  )
}

export const PageHeader = ({ title, description, actions }) => (
  <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>{description && <p className="muted mt-1 max-w-3xl">{description}</p>}</div>{actions}
  </header>
)

export const Callout = ({ children }) => <p className="flex gap-2 rounded-lg border border-brand-100 bg-brand-50 p-3 text-xs text-brand-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /><span>{children}</span></p>
