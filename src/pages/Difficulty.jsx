import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataset } from '../hooks/useDataset'
import { PageHeader, ChartCard, StatCard, Callout } from '../components/common/Cards'
import { Donut, Columns } from '../components/charts/Charts'
import { Heatmap } from '../components/charts/Heatmap'
import { DIFFICULTIES, DIFFICULTY_COLORS, BUCKETS, BUCKET_LABELS } from '../constants'
import { countBy, histogram, mean, median, fmt, prettyCompany } from '../utils/stats'

export default function Difficulty() {
  const { questions, companies } = useDataset()
  const navigate = useNavigate()
  const d = useMemo(() => {
    const acc = questions.map((q) => q.acceptance)
    const counts = countBy(questions, (q) => q.difficulty)
    const hi = questions.reduce((a, q) => (q.acceptance > a.acceptance ? q : a)), lo = questions.reduce((a, q) => (q.acceptance < a.acceptance ? q : a))
    const coverageBands = [[1, 1, '1'], [2, 4, '2–4'], [5, 24, '5–24'], [25, 99, '25–99'], [100, Infinity, '100+']]
    return {
      donut: DIFFICULTIES.map((name) => ({ name, value: counts[name] || 0 })),
      recency: BUCKETS.map((b) => ({ name: BUCKET_LABELS[b], ...Object.fromEntries(DIFFICULTIES.map((x) => [x, questions.filter((q) => q.bucket === b && q.difficulty === x).length])) })),
      accHist: histogram(acc).map((b) => ({ name: b.label, Questions: b.count })),
      accByDiff: DIFFICULTIES.map((x) => ({ name: x, 'Mean acceptance %': +fmt(mean(questions.filter((q) => q.difficulty === x).map((q) => q.acceptance))) })),
      accByCoverage: coverageBands.map(([l, h, name]) => ({ name: `${name} companies`, 'Mean acceptance %': +fmt(mean(questions.filter((q) => q.companyCount >= l && q.companyCount <= h).map((q) => q.acceptance)) ?? 0) })),
      mean: mean(acc), median: median(acc), hi, lo,
      heat: [...companies].sort((a, b) => b.total - a.total).slice(0, 40).map((c) => ({ key: c.name, label: prettyCompany(c.name), values: { Easy: c.easy, Medium: c.medium, Hard: c.hard }, total: c.total })),
    }
  }, [questions, companies])
  return (
    <>
      <PageHeader title="Difficulty & Acceptance" description="Difficulty mix and the dataset's reported acceptance rates." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Mean acceptance" value={`${fmt(d.mean)}%`} /><StatCard label="Median acceptance" value={`${fmt(d.median)}%`} />
        <StatCard label="Highest acceptance" value={`${fmt(d.hi.acceptance)}%`} hint={d.hi.title} onClick={() => navigate(`/questions?search=${encodeURIComponent(d.hi.title)}`)} />
        <StatCard label="Lowest acceptance" value={`${fmt(d.lo.acceptance)}%`} hint={d.lo.title} onClick={() => navigate(`/questions?search=${encodeURIComponent(d.lo.title)}`)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Difficulty share" subtitle="Click a slice to filter questions"><Donut data={d.donut} colors={DIFFICULTY_COLORS} onSliceClick={(s) => navigate(`/questions?difficulty=${s.name}`)} /></ChartCard>
        <ChartCard title="Difficulty by recency" subtitle="Questions by most recent bucket"><Columns stacked data={d.recency} series={DIFFICULTIES.map((k) => ({ key: k, color: DIFFICULTY_COLORS[k] }))} /></ChartCard>
        <ChartCard title="Acceptance distribution" note="Acceptance is the dataset's reported metric, not an indicator of interview importance."><Columns data={d.accHist} series={[{ key: 'Questions', color: '#f59e0b' }]} xLabel="Acceptance %" yLabel="Questions" /></ChartCard>
        <ChartCard title="Acceptance vs difficulty"><Columns data={d.accByDiff} series={[{ key: 'Mean acceptance %', color: '#6366f1' }]} yLabel="Mean acceptance %" /></ChartCard>
        <ChartCard title="Acceptance vs company coverage" subtitle="Mean acceptance by number of companies asking" className="lg:col-span-2"><Columns data={d.accByCoverage} series={[{ key: 'Mean acceptance %', color: '#10b981' }]} yLabel="Mean acceptance %" /></ChartCard>
      </div>
      <section className="mt-6"><h2 className="mb-3 text-base font-semibold">Company × difficulty (top 40 companies by question count)</h2>
        <Heatmap rows={d.heat} columns={DIFFICULTIES} suffixHeader="Total" onRowClick={(r) => navigate(`/companies/${r.key}`)} onCellClick={(r, c) => navigate(`/questions?company=${r.key}&difficulty=${c}`)} /></section>
      <div className="mt-3"><Callout>Topic-wise difficulty is on the Topics page (Difficulty by topic).</Callout></div>
    </>
  )
}
