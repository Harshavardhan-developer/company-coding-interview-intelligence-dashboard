import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataset } from '../hooks/useDataset'
import { PageHeader, ChartCard, Callout } from '../components/common/Cards'
import { CompanySelector, Select } from '../components/common/Controls'
import { QuestionTable } from '../components/common/QuestionTable'
import { BarList, Donut } from '../components/charts/Charts'
import { EmptyState } from '../components/common/States'
import { companyQuestions } from '../utils/analytics'
import { DEFAULT_WEIGHTS } from '../utils/priority'
import { DIFFICULTIES, DIFFICULTY_COLORS, RECENT_BUCKETS, PRIORITY_NOTE } from '../constants'

const SLIDERS = [['frequency', 'Dataset frequency'], ['coverage', 'Company coverage'], ['recency', 'Recency'], ['difficulty', 'Difficulty preference']]

export default function Preparation() {
  const { companies, companyByName, questionById, maxCompanyCount } = useDataset()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS)
  const [preferred, setPreferred] = useState('Any')
  const company = companyByName.get(name)
  const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1

  const rows = useMemo(() => (company ? companyQuestions(company, questionById, weights, maxCompanyCount, preferred) : []), [company, questionById, weights, maxCompanyCount, preferred])
  const sections = useMemo(() => ({
    start: [...rows].sort((a, b) => b.priority - a.priority).slice(0, 15),
    repeated: [...rows].sort((a, b) => b.companyCount - a.companyCount).slice(0, 15),
    recent: rows.filter((q) => RECENT_BUCKETS.includes(q.bucket)).sort((a, b) => b.priority - a.priority),
    specific: rows.filter((q) => q.companyCount === 1).sort((a, b) => b.priority - a.priority),
  }), [rows])

  const Section = ({ title, hint, data, sort }) => (
    <section className="mt-6"><h2 className="text-base font-semibold">{title}</h2>{hint && <p className="muted mb-2 text-xs">{hint}</p>}
      {data.length ? <QuestionTable rows={data} defaultSort={sort || { key: 'priority', dir: 'desc' }} pageSize={8} showRank caption={title} /> : <div className="card"><EmptyState title="Nothing in this group for this company." hint="" /></div>}</section>
  )
  return (
    <>
      <PageHeader title="Preparation Planner" description="Dataset-Based Priority: a transparent weighted score over the supplied dataset. Adjust the weights to see the ranking change instantly." />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="card space-y-4 p-4 lg:self-start">
          <CompanySelector companies={[...companies].sort((a, b) => a.name.localeCompare(b.name))} value={name} onChange={setName} label="Target company" />
          <Select label="Preferred difficulty" allLabel="Any" value={preferred === 'Any' ? '' : preferred} onChange={(v) => setPreferred(v || 'Any')} options={DIFFICULTIES} />
          {SLIDERS.map(([key, label]) => (
            <label key={key} className="block text-sm"><div className="flex justify-between"><span>{label}</span><span className="tabular-nums text-slate-500">{weights[key]} ({Math.round((weights[key] / total) * 100)}%)</span></div>
              <input type="range" min="0" max="100" step="5" value={weights[key]} className="mt-1 w-full accent-indigo-600" onChange={(e) => setWeights((w) => ({ ...w, [key]: Number(e.target.value) }))} /></label>))}
          <button className="btn" onClick={() => { setWeights(DEFAULT_WEIGHTS); setPreferred('Any') }}>Reset weights</button>
          <Callout>{PRIORITY_NOTE} Frequency and recency are this company's own values; coverage is the number of companies asking the question.</Callout>
        </div>
        <div>{!company ? <div className="card"><EmptyState title="Choose a target company." hint="Pick a company to see its Dataset-Based Preparation Priority." /></div> : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <ChartCard title="Core DSA topics (inferred)" height={260}><BarList data={Object.entries(company.topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, v]) => ({ name: n, value: v }))} nameWidth={120} color="#10b981" onBarClick={(b) => navigate(`/questions?company=${company.name}&topic=${encodeURIComponent(b.name)}`)} /></ChartCard>
              <ChartCard title="Difficulty mix" height={260}><Donut colors={DIFFICULTY_COLORS} data={DIFFICULTIES.map((d) => ({ name: d, value: company[d.toLowerCase()] }))} /></ChartCard>
            </div>
            <Section title="Start here" hint="Highest Dataset-Based Priority under your weights." data={sections.start} />
            <Section title="Most repeated" hint="Questions shared across the most companies." data={sections.repeated} sort={{ key: 'companyCount', dir: 'desc' }} />
            <Section title="Recent" hint="Appears in a last-6-month file for this company." data={sections.recent} />
            <Section title="Company-specific" hint="Questions that appear only for this company in the dataset." data={sections.specific} />
          </>)}</div>
      </div>
    </>
  )
}
