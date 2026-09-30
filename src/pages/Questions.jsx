import { useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useDataset } from '../hooks/useDataset'
import { useQuestionFilters } from '../hooks/useQuestionFilters'
import { FilterBar } from '../components/filters/FilterBar'
import { QuestionTable } from '../components/common/QuestionTable'
import { PageHeader, Callout, StatCard } from '../components/common/Cards'
import { FREQUENCY_NOTE, PRIORITY_NOTE } from '../constants'

const COPY = {
  explorer: ['Question Explorer', 'Search and filter every unique problem in the dataset. Click a row for company coverage and details.'],
  repeated: ['Most Repeated Questions', 'Questions ranked by the number of companies whose files contain them. Calculated from the dataset, not curated.'],
  common: ['Most Common Interview Questions Across Companies', 'Raise the minimum company count to focus on questions that recur across many companies.'],
}
const TIERS = [5, 10, 25, 50, 100]

function QuestionsView({ mode }) {
  const { questions, companies } = useDataset()
  const [params] = useSearchParams()
  const initial = Object.fromEntries(['difficulty', 'topic', 'recency', 'company', 'minCompanies', 'search'].filter((k) => params.get(k)).map((k) => [k, params.get(k)]))
  if (mode === 'common' && !initial.minCompanies) initial.minCompanies = '10'
  const state = useQuestionFilters(questions, initial)
  const [title, description] = COPY[mode]
  const rows = useMemo(() => (mode === 'explorer' ? state.filtered : [...state.filtered].sort((a, b) => b.companyCount - a.companyCount)), [state.filtered, mode])

  // Top-N coverage insight: how many companies the Nth most repeated question reaches.
  const topN = useMemo(() => {
    const ranked = [...questions].sort((a, b) => b.companyCount - a.companyCount)
    return [10, 25, 50, 100].map((n) => ({ n, top: ranked[0], min: ranked[Math.min(n, ranked.length) - 1]?.companyCount }))
  }, [questions])

  return (
    <>
      <PageHeader title={title} description={description} />
      {mode === 'common' && (
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Minimum company count">{TIERS.map((t) => <button key={t} className={`btn ${Number(state.filters.minCompanies) === t ? 'btn-primary' : ''}`} onClick={() => state.set('minCompanies')(String(t))}>{t}+ companies</button>)}</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{topN.map(({ n, top, min }) => <StatCard key={n} label={`Top ${n} most repeated`} value={`≥ ${min} companies`} hint={n === 10 ? `#1: ${top.title} — ${top.companyCount} companies` : 'each question in this group'} />)}</div>
        </div>
      )}
      <FilterBar state={state} companies={companies} count={rows.length} total={questions.length} hide={mode === 'common' ? [] : []} />
      <QuestionTable rows={rows} showRank={mode !== 'explorer'} caption={title} />
      <div className="mt-3 space-y-2"><Callout>{FREQUENCY_NOTE}</Callout><Callout>{PRIORITY_NOTE} Acceptance is the dataset's reported metric and does not indicate interview importance.</Callout></div>
    </>
  )
}
// Re-mount when the query string changes so chart click-throughs apply their filters.
export default function Questions({ mode }) {
  const { search } = useLocation()
  return <QuestionsView key={mode + search} mode={mode} />
}
