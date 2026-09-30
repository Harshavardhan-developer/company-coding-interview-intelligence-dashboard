import { useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useDataset } from '../hooks/useDataset'
import { PageHeader, StatCard, ChartCard, Callout } from '../components/common/Cards'
import { BarList, Columns } from '../components/charts/Charts'
import { DataTable } from '../components/tables/DataTable'
import { QuestionTable } from '../components/common/QuestionTable'
import { FOCUS_TOPICS } from '../utils/topics'
import { DIFFICULTY_COLORS } from '../constants'
import { fmt, prettyCompany } from '../utils/stats'

export default function Topics() {
  const { topicStats, companies } = useDataset()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const selected = topicStats.find((t) => t.topic === params.get('topic'))
  const select = (topic) => setParams(topic ? { topic } : {})

  const companyRows = useMemo(() => {
    if (!selected) return []
    return companies.filter((c) => c.topicCounts[selected.topic]).map((c) => ({ name: c.name, count: c.topicCounts[selected.topic], share: (c.topicCounts[selected.topic] / c.total) * 100 })).sort((a, b) => b.count - a.count)
  }, [selected, companies])

  const columns = [
    { key: 'topic', label: 'Topic (inferred)', render: (t) => <button className="link" onClick={(e) => { e.stopPropagation(); select(t.topic) }}>{t.topic}</button> },
    { key: 'total', label: 'Questions', align: 'right' }, { key: 'companyCount', label: 'Companies', align: 'right' },
    { key: 'coverage', label: 'Coverage %', align: 'right', render: (t) => fmt(t.coverage) },
    { key: 'avgAcceptance', label: 'Avg accept. %', align: 'right', render: (t) => fmt(t.avgAcceptance) },
    { key: 'avgFrequency', label: 'Avg freq. %', align: 'right', render: (t) => fmt(t.avgFrequency) },
    { key: 'recent', label: 'Recent', align: 'right' },
    { key: 'mix', label: 'E / M / H', sortable: false, render: (t) => `${t.easy} / ${t.medium} / ${t.hard}` },
  ]
  return (
    <>
      <PageHeader title="Topics / DSA" description="Inferred Topic labels come from keyword rules applied to problem titles. They are not official tags, and one question can match several topics." />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Focus topics">
        {FOCUS_TOPICS.map((t) => <button key={t} className={`btn ${selected?.topic === t ? 'btn-primary' : ''}`} onClick={() => select(t)}>{t}</button>)}
      </div>
      {selected ? (
        <>
          <div className="mb-3 flex items-center gap-3"><h2 className="text-lg font-semibold">{selected.topic} <span className="muted text-sm font-normal">(Inferred Topic)</span></h2><button className="btn" onClick={() => select(null)}>All topics</button></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Questions" value={selected.total} /><StatCard label="Companies asking" value={selected.companyCount} hint={`${fmt(selected.coverage)}% of companies`} />
            <StatCard label="Avg acceptance" value={`${fmt(selected.avgAcceptance)}%`} /><StatCard label="Recent questions" value={selected.recent} hint="last-6-month buckets" />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ChartCard title="Difficulty distribution" height={220}><BarList data={['Easy', 'Medium', 'Hard'].map((d) => ({ name: d, value: selected[d.toLowerCase()] }))} color={DIFFICULTY_COLORS.Medium} onBarClick={(b) => navigate(`/questions?topic=${encodeURIComponent(selected.topic)}&difficulty=${b.name}`)} /></ChartCard>
            <ChartCard title="Companies asking this topic" subtitle="Top 12 by question count" height={220}><BarList data={companyRows.slice(0, 12).map((c) => ({ name: prettyCompany(c.name), slug: c.name, value: c.count }))} color="#0ea5e9" onBarClick={(b) => navigate(`/companies/${b.slug}`)} /></ChartCard>
          </div>
          <h3 className="mb-2 mt-6 text-base font-semibold">Most common {selected.topic} questions</h3>
          <QuestionTable rows={selected.questions} showRank pageSize={10} caption={`${selected.topic} questions`} />
          <h3 className="mb-2 mt-6 text-base font-semibold">Company-wise distribution</h3>
          <DataTable caption="Company distribution" rows={companyRows} rowKey={(c) => c.name} pageSize={10} defaultSort={{ key: 'count', dir: 'desc' }}
            columns={[{ key: 'name', label: 'Company', render: (c) => <Link className="link" to={`/companies/${c.name}`}>{prettyCompany(c.name)}</Link> }, { key: 'count', label: 'Questions', align: 'right' }, { key: 'share', label: '% of company questions', align: 'right', render: (c) => fmt(c.share) }]} />
        </>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Questions per topic" height={460}><BarList data={topicStats.map((t) => ({ name: t.topic, value: t.total }))} nameWidth={150} onBarClick={(b) => select(b.name)} /></ChartCard>
            <ChartCard title="Difficulty by topic" subtitle="Stacked" height={460}><Columns stacked data={topicStats.slice(0, 14).map((t) => ({ name: t.topic, Easy: t.easy, Medium: t.medium, Hard: t.hard }))} series={['Easy', 'Medium', 'Hard'].map((k) => ({ key: k, color: DIFFICULTY_COLORS[k] }))} /></ChartCard>
          </div>
          <div className="mt-4"><DataTable caption="Topic analytics" columns={columns} rows={topicStats} rowKey={(t) => t.topic} pageSize={30} defaultSort={{ key: 'total', dir: 'desc' }} onRowClick={(t) => select(t.topic)} /></div>
        </>
      )}
      <div className="mt-4"><Callout>Inferred Topic: classifications are derived from problem titles only (no topic column exists in the dataset), so some questions are mislabeled or fall under Other.</Callout></div>
    </>
  )
}
