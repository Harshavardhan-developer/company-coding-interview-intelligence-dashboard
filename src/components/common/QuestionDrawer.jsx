import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Drawer } from './Modal'
import { DifficultyBadge, RecencyBadge, PriorityBadge, TopicChip } from './Badges'
import { useDataset } from '../../hooks/useDataset'
import { fmt, prettyCompany } from '../../utils/stats'
import { BUCKETS, BUCKET_LABELS, BUCKET_COLORS, FREQUENCY_NOTE, PRIORITY_NOTE } from '../../constants'

const Fact = ({ label, children }) => <div><dt className="muted text-xs">{label}</dt><dd className="mt-0.5 text-sm font-medium">{children}</dd></div>

export function QuestionDrawer() {
  const { openId, closeQuestion, questionById, companies } = useDataset()
  const q = openId != null ? questionById?.get(openId) : null
  if (!q) return null
  const share = (q.companyCount / companies.length) * 100
  return (
    <Drawer open onClose={closeQuestion} title={q.title}>
      <div className="mb-4 flex flex-wrap gap-2"><DifficultyBadge value={q.difficulty} /><RecencyBadge value={q.bucket} />{q.topics.map((t) => <TopicChip key={t}>{t}</TopicChip>)}</div>
      <dl className="grid grid-cols-2 gap-4">
        <Fact label="Problem ID">#{q.id}</Fact>
        <Fact label="Companies">{q.companyCount} <span className="muted">(asked by {q.companyCount} of {companies.length} companies)</span></Fact>
        <Fact label="Average acceptance">{fmt(q.acceptance)}%</Fact>
        <Fact label="Avg. dataset frequency">{q.frequency == null ? 'Not available from supplied dataset.' : `${fmt(q.frequency)}%`}</Fact>
        <Fact label="Dataset-Based Priority"><PriorityBadge value={q.priority} /></Fact>
        <Fact label="Primary inferred topic">{q.topic}</Fact>
      </dl>
      <a className="btn btn-primary mt-4" href={q.url} target="_blank" rel="noreferrer">Open problem <ExternalLink className="h-4 w-4" /></a>
      <h3 className="mt-6 text-sm font-semibold">Company coverage</h3>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="img" aria-label={`${share.toFixed(1)}% of companies`}><div className="h-full bg-brand-500" style={{ width: `${Math.max(share, 1)}%` }} /></div>
      <p className="muted mt-1 text-xs">{share.toFixed(1)}% of companies in the dataset</p>
      <h3 className="mt-5 text-sm font-semibold">Recency across companies</h3>
      <ul className="mt-2 space-y-1 text-sm">{BUCKETS.filter((b) => q.buckets[b]).map((b) => <li key={b} className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ background: BUCKET_COLORS[b] }} />{BUCKET_LABELS[b]}: {q.buckets[b]}</li>)}</ul>
      <h3 className="mt-5 text-sm font-semibold">Companies asking it ({q.companyCount})</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">{[...q.companies].sort().map((c) => <Link key={c} onClick={closeQuestion} to={`/companies/${c}`} className="rounded-md border border-slate-200 px-2 py-0.5 text-xs hover:border-brand-500 dark:border-slate-700">{prettyCompany(c)}</Link>)}</div>
      <p className="muted mt-6 text-xs">{FREQUENCY_NOTE} {PRIORITY_NOTE}</p>
    </Drawer>
  )
}
