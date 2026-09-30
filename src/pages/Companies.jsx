import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataset } from '../hooks/useDataset'
import { PageHeader } from '../components/common/Cards'
import { SearchBar, Select, TopicSelector, NumberInput, Pagination } from '../components/common/Controls'
import { EmptyState } from '../components/common/States'
import { TOPIC_NAMES } from '../utils/topics'
import { DIFFICULTIES, BUCKETS, BUCKET_LABELS } from '../constants'
import { fmt, prettyCompany } from '../utils/stats'

const PAGE = 24
export function CompanyCard({ company, questionById }) {
  const c = company
  const topTopics = Object.entries(c.topicCounts).filter(([t]) => t !== 'Other').sort((a, b) => b[1] - a[1]).slice(0, 3)
  const repeated = c.records.map((r) => questionById.get(r.id)).sort((a, b) => b.companyCount - a.companyCount).slice(0, 3)
  return (
    <article className="card flex flex-col p-4">
      <div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{prettyCompany(c.name)}</h3><span className="muted tabular-nums">{c.total} questions</span></div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full" role="img" aria-label={`Easy ${c.easy}, Medium ${c.medium}, Hard ${c.hard}`}>
        <span style={{ width: `${(c.easy / c.total) * 100}%`, background: '#10b981' }} /><span style={{ width: `${(c.medium / c.total) * 100}%`, background: '#f59e0b' }} /><span style={{ width: `${(c.hard / c.total) * 100}%`, background: '#ef4444' }} />
      </div>
      <p className="muted mt-1 text-xs">Easy {c.easy} · Medium {c.medium} · Hard {c.hard} · Recent {c.recent}</p>
      <p className="muted mt-2 text-xs">Avg acceptance {fmt(c.avgAcceptance)}% · Avg frequency {c.avgFrequency == null ? '—' : fmt(c.avgFrequency) + '%'}</p>
      <p className="mt-2 text-xs"><span className="muted">Top topics (inferred): </span>{topTopics.map(([t, n]) => `${t} (${n})`).join(', ') || '—'}</p>
      <p className="mt-2 text-xs"><span className="muted">Most repeated: </span>{repeated.map((q) => q.title).join(' · ')}</p>
      <Link to={`/companies/${c.name}`} className="btn btn-primary mt-4 self-start">View Company</Link>
    </article>
  )
}

export default function Companies() {
  const { companies, questionById } = useDataset()
  const [f, setF] = useState({ search: '', min: '', difficulty: '', recency: '', topic: '' })
  const [page, setPage] = useState(0)
  const set = (k) => (v) => { setF((s) => ({ ...s, [k]: v })); setPage(0) }
  const rows = useMemo(() => companies.filter((c) => {
    if (f.search && !(c.name.includes(f.search.toLowerCase().replace(/\s+/g, '-')) || prettyCompany(c.name).toLowerCase().includes(f.search.toLowerCase()))) return false
    if (f.min && c.total < Number(f.min)) return false
    if (f.difficulty && !c[f.difficulty.toLowerCase()]) return false
    if (f.recency && !c.bucketCounts[f.recency]) return false
    if (f.topic && !c.topicCounts[f.topic]) return false
    return true
  }).sort((a, b) => b.total - a.total), [companies, f])
  const visible = rows.slice(page * PAGE, (page + 1) * PAGE)
  return (
    <>
      <PageHeader title="Companies" description="Every company in the dataset. Filters keep companies that have at least one matching question." />
      <div className="card mb-4 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[14rem] flex-1"><SearchBar value={f.search} onChange={set('search')} placeholder="Search company name…" label="Search companies" /></div>
        <NumberInput label="Min questions" value={f.min} onChange={set('min')} />
        <Select label="Has difficulty" value={f.difficulty} onChange={set('difficulty')} options={DIFFICULTIES} />
        <Select label="Has recency" value={f.recency} onChange={set('recency')} options={BUCKETS.map((b) => ({ value: b, label: BUCKET_LABELS[b] }))} />
        <TopicSelector value={f.topic} onChange={set('topic')} options={TOPIC_NAMES} />
        <span className="muted" aria-live="polite">{rows.length} companies</span>
      </div>
      {rows.length === 0 ? <EmptyState title="No matching companies found." /> : (
        <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map((c) => <CompanyCard key={c.name} company={c} questionById={questionById} />)}</div>
          <div className="card mt-4"><Pagination page={page} pageCount={Math.ceil(rows.length / PAGE)} total={rows.length} pageSize={PAGE} onChange={setPage} /></div></>
      )}
    </>
  )
}
