import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, FileQuestion, Database, Repeat, Gauge, Percent, Clock, Shapes } from 'lucide-react'
import { useDataset } from '../hooks/useDataset'
import { StatCard, ChartCard, PageHeader, Callout } from '../components/common/Cards'
import { BarList, Columns, Donut } from '../components/charts/Charts'
import { QuestionTable } from '../components/common/QuestionTable'
import { DIFFICULTIES, DIFFICULTY_COLORS, BUCKETS, BUCKET_LABELS, BUCKET_COLORS, RECENT_BUCKETS, FREQUENCY_NOTE } from '../constants'
import { countBy, histogram, mean, fmt, fmtInt, prettyCompany } from '../utils/stats'

export default function Dashboard() {
  const { questions, companies, rows, topicStats, openQuestion } = useDataset()
  const navigate = useNavigate()

  const d = useMemo(() => {
    const diff = countBy(questions, (q) => q.difficulty)
    const bucket = countBy(questions, (q) => q.bucket)
    const repeated = [...questions].sort((a, b) => b.companyCount - a.companyCount)
    const topDifficulty = Object.entries(diff).sort((a, b) => b[1] - a[1])[0]
    const coverageBins = [[1, 1, '1'], [2, 2, '2'], [3, 4, '3–4'], [5, 9, '5–9'], [10, 24, '10–24'], [25, 49, '25–49'], [50, Infinity, '50+']]
    return {
      repeated, topDifficulty,
      diff: DIFFICULTIES.map((name) => ({ name, value: diff[name] || 0 })),
      bucket: BUCKETS.map((b) => ({ name: BUCKET_LABELS[b], key: b, value: bucket[b] || 0, color: BUCKET_COLORS[b] })),
      recent: questions.filter((q) => RECENT_BUCKETS.includes(q.bucket)).length,
      avgAcceptance: mean(questions.map((q) => q.acceptance)),
      topCompanies: [...companies].sort((a, b) => b.total - a.total).slice(0, 15).map((c) => ({ name: prettyCompany(c.name), slug: c.name, value: c.total })),
      topQuestions: repeated.slice(0, 20).map((q) => ({ name: q.title, id: q.id, value: q.companyCount })),
      topics: topicStats.slice(0, 15).map((t) => ({ name: t.topic, value: t.total })),
      freq: histogram(questions.filter((q) => q.frequency != null).map((q) => q.frequency)).map((b) => ({ name: b.label, Questions: b.count })),
      acc: histogram(questions.map((q) => q.acceptance)).map((b) => ({ name: b.label, Questions: b.count })),
      coverage: coverageBins.map(([lo, hi, name]) => ({ name, Questions: questions.filter((q) => q.companyCount >= lo && q.companyCount <= hi).length })),
    }
  }, [questions, companies, topicStats])

  const top = d.repeated[0]
  return (
    <>
      <PageHeader title="Coding Interview Intelligence" description="Descriptive analytics computed live from the supplied company-wise question dataset." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Companies" value={fmtInt(companies.length)} icon={Building2} onClick={() => navigate('/companies')} />
        <StatCard label="Unique questions" value={fmtInt(questions.length)} icon={FileQuestion} onClick={() => navigate('/questions')} />
        <StatCard label="Company-question records" value={fmtInt(rows)} icon={Database} />
        <StatCard label="Most repeated question" value={top.title} hint={`${top.companyCount} companies`} icon={Repeat} onClick={() => openQuestion(top.id)} />
        <StatCard label="Most common difficulty" value={d.topDifficulty[0]} hint={`${fmtInt(d.topDifficulty[1])} questions`} icon={Gauge} onClick={() => navigate(`/questions?difficulty=${d.topDifficulty[0]}`)} />
        <StatCard label="Average acceptance" value={`${fmt(d.avgAcceptance)}%`} hint="dataset-reported metric" icon={Percent} />
        <StatCard label="Recent questions" value={fmtInt(d.recent)} hint="in a last-6-month bucket" icon={Clock} onClick={() => navigate('/recency')} />
        <StatCard label="Inferred DSA topics" value={topicStats.length} icon={Shapes} onClick={() => navigate('/topics')} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Questions by difficulty" subtitle="Click a slice to filter questions"><Donut data={d.diff} colors={DIFFICULTY_COLORS} onSliceClick={(s) => navigate(`/questions?difficulty=${s.name}`)} /></ChartCard>
        <ChartCard title="Questions by recency" subtitle="Most recent bucket in which a question appears for any company" note="Unspecified = appears only in all.csv."><Donut data={d.bucket} onSliceClick={(s) => navigate(`/questions?recency=${s.key}`)} /></ChartCard>
        <ChartCard title="Top 20 most repeated questions" subtitle="Number of companies asking" height={520}><BarList data={d.topQuestions} valueLabel="Companies" nameWidth={170} onBarClick={(b) => openQuestion(b.id)} /></ChartCard>
        <ChartCard title="Companies with most questions" subtitle="Top 15 · click a bar to open" height={520}><BarList data={d.topCompanies} valueLabel="Questions" color="#0ea5e9" onBarClick={(b) => navigate(`/companies/${b.slug}`)} /></ChartCard>
        <ChartCard title="Topic distribution (inferred)" subtitle="Questions per inferred topic · a question can match several" height={420}><BarList data={d.topics} valueLabel="Questions" color="#10b981" nameWidth={150} onBarClick={(b) => navigate(`/topics?topic=${encodeURIComponent(b.name)}`)} /></ChartCard>
        <ChartCard title="Company coverage distribution" subtitle="How many questions are asked by N companies" height={420}><Columns data={d.coverage} series={[{ key: 'Questions', color: '#6366f1' }]} xLabel="Number of companies" yLabel="Questions" /></ChartCard>
        <ChartCard title="Frequency distribution" subtitle="Average all.csv frequency per question" note={FREQUENCY_NOTE}><Columns data={d.freq} series={[{ key: 'Questions', color: '#8b5cf6' }]} xLabel="Frequency %" yLabel="Questions" /></ChartCard>
        <ChartCard title="Acceptance distribution" subtitle="Dataset-reported acceptance rate" note="Acceptance is not a measure of interview importance."><Columns data={d.acc} series={[{ key: 'Questions', color: '#f59e0b' }]} xLabel="Acceptance %" yLabel="Questions" /></ChartCard>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-semibold">Most repeated questions</h2>
        <QuestionTable rows={d.repeated.slice(0, 15)} showRank pageSize={15} caption="Most repeated questions" />
        <div className="mt-2"><Callout>Priority is dataset-based and not predictive. See Methodology.</Callout></div>
      </section>
    </>
  )
}
