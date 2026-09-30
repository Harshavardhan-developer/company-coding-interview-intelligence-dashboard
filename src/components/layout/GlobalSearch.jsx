import { useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useDataset } from '../../hooks/useDataset'
import { useDebounce } from '../../hooks/useDebounce'
import { TOPIC_NAMES } from '../../utils/topics'
import { prettyCompany } from '../../utils/stats'

// Searches companies, questions (title or problem id) and inferred topics.
export default function GlobalSearch() {
  const { companies, questions, status, openQuestion } = useDataset()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const query = useDebounce(text.trim().toLowerCase(), 200)
  const navigate = useNavigate()
  const box = useRef(null)
  useEffect(() => {
    const close = (e) => !box.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const results = useMemo(() => {
    if (!query || status !== 'ready') return null
    return {
      companies: companies.filter((c) => c.name.includes(query.replace(/\s+/g, '-')) || prettyCompany(c.name).toLowerCase().includes(query)).slice(0, 5),
      questions: questions.filter((q) => q.title.toLowerCase().includes(query) || String(q.id) === query).sort((a, b) => b.companyCount - a.companyCount).slice(0, 6),
      topics: TOPIC_NAMES.filter((t) => t.toLowerCase().includes(query)).slice(0, 4),
    }
  }, [query, companies, questions, status])

  const go = (fn) => { fn(); setOpen(false); setText('') }
  const empty = results && !results.companies.length && !results.questions.length && !results.topics.length
  const Group = ({ title, children }) => children.length ? <div className="py-1"><div className="px-3 py-1 text-xs font-semibold uppercase text-slate-400">{title}</div>{children}</div> : null
  const Item = ({ onClick, children }) => <button className="block w-full truncate px-3 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => go(onClick)}>{children}</button>
  return (
    <div ref={box} className="relative max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
      <input className="input pl-9" type="search" aria-label="Global search" placeholder="Search companies, questions, topics, problem IDs…" value={text} onFocus={() => setOpen(true)} onChange={(e) => { setText(e.target.value); setOpen(true) }} />
      {open && results && (
        <div className="card absolute left-0 right-0 top-11 z-40 max-h-96 overflow-y-auto">
          {empty && <p className="muted p-3">No matches found.</p>}
          <Group title="Companies">{results.companies.map((c) => <Item key={c.name} onClick={() => navigate(`/companies/${c.name}`)}>{prettyCompany(c.name)} <span className="muted">· {c.total} questions</span></Item>)}</Group>
          <Group title="Questions">{results.questions.map((q) => <Item key={q.id} onClick={() => openQuestion(q.id)}>{q.title} <span className="muted">#{q.id} · {q.companyCount} companies</span></Item>)}</Group>
          <Group title="Topics (inferred)">{results.topics.map((t) => <Item key={t} onClick={() => navigate(`/topics?topic=${encodeURIComponent(t)}`)}>{t}</Item>)}</Group>
        </div>
      )}
    </div>
  )
}
