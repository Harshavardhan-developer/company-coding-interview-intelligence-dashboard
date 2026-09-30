import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDataset } from '../hooks/useDataset'
import { useQuestionFilters } from '../hooks/useQuestionFilters'
import { PageHeader, StatCard, ChartCard, Callout } from '../components/common/Cards'
import { BarList, Donut } from '../components/charts/Charts'
import { QuestionTable } from '../components/common/QuestionTable'
import { FilterBar } from '../components/filters/FilterBar'
import { EmptyState } from '../components/common/States'
import { companyQuestions } from '../utils/analytics'
import { DEFAULT_WEIGHTS } from '../utils/priority'
import { DIFFICULTY_COLORS, BUCKETS, BUCKET_LABELS, BUCKET_COLORS, FREQUENCY_NOTE, PRIORITY_NOTE } from '../constants'
import { fmt, prettyCompany } from '../utils/stats'

const TIERS = [['specific', 'Company-specific (only this company)'], [2, '2+ companies'], [3, '3+ companies'], [5, '5+ companies'], [10, '10+ companies'], [25, '25+ companies'], [50, '50+ companies'], [100, '100+ companies']]

export default function CompanyDetails() {
  const { name } = useParams()
  const { companyByName, questionById, maxCompanyCount } = useDataset()
  const navigate = useNavigate()
  const company = companyByName.get(name)
  const rows = useMemo(() => (company ? companyQuestions(company, questionById, DEFAULT_WEIGHTS, maxCompanyCount) : []), [company, questionById, maxCompanyCount])
  const state = useQuestionFilters(rows)
  if (!company) return <EmptyState title="Company not found in the dataset." hint="Return to the companies list." />
  const c = company
  const byFrequency = [...rows].sort((a, b) => (b.frequency ?? -1) - (a.frequency ?? -1) || b.companyCount - a.companyCount).slice(0, 15)
  const specific = rows.filter((q) => q.companyCount === 1)
  const topics = Object.entries(c.topicCounts).sort((a, b) => b[1] - a[1]).map(([n, v]) => ({ name: n, value: v }))
  return (
    <>
      <Link to="/companies" className="link mb-3 inline-flex items-center gap-1 text-sm"><ArrowLeft className="h-4 w-4" />All companies</Link>
      <PageHeader title={`${prettyCompany(c.name)} — Company Interview Profile`} description="What this company's files contain. Descriptive only; not a prediction of future interviews." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total questions" value={c.total} hint={`${c.sharing.specific} company-specific`} />
        <StatCard label="Easy / Medium / Hard" value={`${c.easy} / ${c.medium} / ${c.hard}`} hint={`${fmt((c.easy / c.total) * 100, 0)}% / ${fmt((c.medium / c.total) * 100, 0)}% / ${fmt((c.hard / c.total) * 100, 0)}%`} />
        <StatCard label="Acceptance" value={`${fmt(c.avgAcceptance)}% avg`} hint={`median ${fmt(c.medianAcceptance)} · min ${fmt(c.minAcceptance)} · max ${fmt(c.maxAcceptance)}`} />
        <StatCard label="Frequency (all.csv)" value={c.avgFrequency == null ? '—' : `${fmt(c.avgFrequency)}% avg`} hint={c.maxFrequency == null ? 'Not available from supplied dataset.' : `max ${fmt(c.maxFrequency)}%`} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Difficulty" height={240}><Donut data={['Easy', 'Medium', 'Hard'].map((d) => ({ name: d, value: c[d.toLowerCase()] }))} colors={DIFFICULTY_COLORS} onSliceClick={(s) => state.set('difficulty')(s.name)} /></ChartCard>
        <ChartCard title="Recency" subtitle={`${c.recent} recent (last 6 months)`} height={240}><Donut data={BUCKETS.map((b) => ({ name: BUCKET_LABELS[b], value: c.bucketCounts[b], color: BUCKET_COLORS[b] }))} /></ChartCard>
        <ChartCard title="Topics (inferred)" subtitle="Click to filter the question bank" height={240}><BarList data={topics.slice(0, 8)} nameWidth={120} color="#10b981" onBarClick={(b) => state.set('topic')(b.name)} /></ChartCard>
      </div>

      <section className="mt-6"><h2 className="mb-3 text-base font-semibold">Most frequently asked questions at this company</h2>
        <QuestionTable rows={byFrequency} showRank defaultSort={null} pageSize={15} caption="Most frequently asked questions" />
        <div className="mt-2 space-y-2"><Callout>{FREQUENCY_NOTE}</Callout><Callout>{PRIORITY_NOTE}</Callout></div></section>

      <section className="mt-6"><h2 className="mb-3 text-base font-semibold">Question sharing with other companies</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{TIERS.map(([k, label]) => <div key={k} className="card p-3"><div className="text-xl font-semibold tabular-nums">{c.sharing[k]}</div><div className="muted text-xs">{k === 'specific' ? label : `Shared with ${label}`}</div></div>)}</div>
        {specific.length > 0 && <div className="mt-3"><h3 className="mb-2 text-sm font-semibold">Company-Specific questions ({specific.length})</h3><QuestionTable rows={specific} pageSize={8} defaultSort={{ key: 'frequency', dir: 'desc' }} caption="Company-specific questions" /></div>}
      </section>

      <section className="mt-6"><h2 className="mb-3 text-base font-semibold">Company question bank</h2>
        <FilterBar state={state} hide={['company', 'minCompanies']} count={state.filtered.length} total={rows.length} />
        <QuestionTable rows={state.filtered} defaultSort={{ key: 'frequency', dir: 'desc' }} caption="Company question bank" /></section>
    </>
  )
}
