import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataset } from '../hooks/useDataset'
import { PageHeader, ChartCard, StatCard, Callout } from '../components/common/Cards'
import { Columns } from '../components/charts/Charts'
import { BUCKETS, BUCKET_LABELS, BUCKET_COLORS, DIFFICULTIES, DIFFICULTY_COLORS } from '../constants'
import { fmtInt } from '../utils/stats'

export default function Recency() {
  const { questions, companies, topicStats } = useDataset()
  const navigate = useNavigate()
  const d = useMemo(() => {
    const perBucket = BUCKETS.map((b) => {
      const qs = questions.filter((q) => q.bucket === b)
      return { key: b, name: BUCKET_LABELS[b], questions: qs.length, records: companies.reduce((s, c) => s + c.bucketCounts[b], 0), companies: companies.filter((c) => c.bucketCounts[b] > 0).length, ...Object.fromEntries(DIFFICULTIES.map((x) => [x, qs.filter((q) => q.difficulty === x).length])) }
    })
    const topics = topicStats.slice(0, 14).map((t) => ({ name: t.topic, ...Object.fromEntries(BUCKETS.map((b) => [b, t.questions.filter((q) => q.bucket === b).length])) }))
    return { perBucket, topics }
  }, [questions, companies, topicStats])
  return (
    <>
      <PageHeader title="Recency Analytics" description="Recency buckets come from which source files a company-question pair appears in. The bucket for a pair is the most recent file that contains it." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{d.perBucket.map((b) => <StatCard key={b.key} label={b.name} value={fmtInt(b.questions)} hint={`${b.companies} companies · ${fmtInt(b.records)} records`} onClick={() => navigate(`/questions?recency=${b.key}`)} />)}</div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Questions by recency bucket" subtitle="Unique questions by their most recent bucket"><Columns data={d.perBucket.map((b) => ({ name: b.name, Questions: b.questions }))} series={[{ key: 'Questions', color: '#6366f1' }]} yLabel="Questions" onBarClick={(_, s) => s} /></ChartCard>
        <ChartCard title="Difficulty by recency" subtitle="Stacked"><Columns stacked data={d.perBucket} series={DIFFICULTIES.map((k) => ({ key: k, color: DIFFICULTY_COLORS[k] }))} /></ChartCard>
        <ChartCard title="Topics by recency (inferred)" subtitle="Top 14 topics · stacked by bucket" className="lg:col-span-2" height={380}><Columns stacked data={d.topics} series={BUCKETS.map((b) => ({ key: b, name: BUCKET_LABELS[b], color: BUCKET_COLORS[b] }))} /></ChartCard>
      </div>
      <div className="mt-4 space-y-2">
        <Callout>Limitations: the bucket depends on the source file structure. A pair that appears only in all.csv is labeled Unspecified — recency is never guessed. Older buckets are not evidence of lower relevance; they reflect what the supplied files contain.</Callout>
        <Callout>Frequency values are relative to their own source file and must not be compared across buckets.</Callout>
      </div>
    </>
  )
}
