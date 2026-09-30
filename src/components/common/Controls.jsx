import { useEffect, useState } from 'react'
import { Search, X, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'

export function SearchBar({ value, onChange, placeholder = 'Search…', label = 'Search' }) {
  const [text, setText] = useState(value)
  const debounced = useDebounce(text, 200)
  useEffect(() => { if (debounced !== value) onChange(debounced) }, [debounced]) // eslint-disable-line
  useEffect(() => setText(value), [value])
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
      <input className="input pl-9 pr-8" type="search" aria-label={label} placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} />
      {text && <button aria-label="Clear search" className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-700" onClick={() => setText('')}><X className="h-4 w-4" /></button>}
    </div>
  )
}

export function Select({ label, value, onChange, options, allLabel = 'All' }) {
  return (
    <label className="block min-w-[8rem] text-xs font-medium text-slate-500 dark:text-slate-400">{label}
      <select className="input mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </label>
  )
}
export const TopicSelector = (props) => <Select label="Topic (inferred)" allLabel="All topics" {...props} />

export function NumberInput({ label, value, onChange, min = 0, max = 100, placeholder }) {
  return (
    <label className="block w-24 text-xs font-medium text-slate-500 dark:text-slate-400">{label}
      <input className="input mt-1" type="number" min={min} max={max} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

export function CompanySelector({ companies, value, onChange, label = 'Company', allLabel = 'Select company' }) {
  return <Select label={label} allLabel={allLabel} value={value} onChange={onChange} options={companies.map((c) => ({ value: c.name, label: `${c.name} (${c.total})` }))} />
}

export function Pagination({ page, pageCount, total, pageSize, onChange }) {
  if (total === 0) return null
  const from = page * pageSize + 1, to = Math.min(total, (page + 1) * pageSize)
  return (
    <nav className="flex items-center justify-between gap-3 border-t border-slate-200 px-3 py-2.5 text-sm dark:border-slate-800" aria-label="Pagination">
      <span className="muted tabular-nums">{from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}</span>
      <div className="flex items-center gap-2">
        <button className="btn px-2" disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
        <span className="muted tabular-nums">Page {page + 1} / {pageCount}</span>
        <button className="btn px-2" disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </nav>
  )
}

export const ThemeToggle = ({ theme, onToggle }) => (
  <button className="btn px-2.5" onClick={onToggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
)

export const Tabs = ({ tabs, value, onChange }) => (
  <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
    {tabs.map((t) => <button key={t.value} role="tab" aria-selected={value === t.value} onClick={() => onChange(t.value)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${value === t.value ? 'border-brand-600 text-brand-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>{t.label}</button>)}
  </div>
)
