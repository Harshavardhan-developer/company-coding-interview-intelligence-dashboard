import { SearchBar, Select, TopicSelector, NumberInput } from '../common/Controls'
import { DIFFICULTIES, BUCKETS, BUCKET_LABELS } from '../../constants'
import { TOPIC_NAMES } from '../../utils/topics'
import { prettyCompany } from '../../utils/stats'

/** Filter controls bound to useQuestionFilters(). Pass `hide` to drop controls that do not apply. */
export function FilterBar({ state, companies, hide = [], count, total }) {
  const { filters: f, set, reset, active } = state
  const show = (key) => !hide.includes(key)
  return (
    <div className="card mb-4 space-y-3 p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <SearchBar value={f.search} onChange={set('search')} placeholder="Search title, problem ID, company or topic…" label="Search questions" />
        <div className="muted self-center text-sm" aria-live="polite">{count.toLocaleString()} of {total.toLocaleString()} questions</div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        {show('difficulty') && <Select label="Difficulty" value={f.difficulty} onChange={set('difficulty')} options={DIFFICULTIES} />}
        {show('topic') && <TopicSelector value={f.topic} onChange={set('topic')} options={TOPIC_NAMES} />}
        {show('company') && companies && <Select label="Company" value={f.company} onChange={set('company')} allLabel="All companies" options={companies.map((c) => ({ value: c.name, label: prettyCompany(c.name) }))} />}
        {show('recency') && <Select label="Recency" value={f.recency} onChange={set('recency')} options={BUCKETS.map((b) => ({ value: b, label: BUCKET_LABELS[b] }))} />}
        {show('minCompanies') && <NumberInput label="Min companies" min={1} value={f.minCompanies} onChange={set('minCompanies')} placeholder="1" />}
        <NumberInput label="Accept. ≥ %" value={f.accMin} onChange={set('accMin')} />
        <NumberInput label="Accept. ≤ %" value={f.accMax} onChange={set('accMax')} />
        <NumberInput label="Freq. ≥ %" value={f.freqMin} onChange={set('freqMin')} />
        <NumberInput label="Freq. ≤ %" value={f.freqMax} onChange={set('freqMax')} />
        {active && <button className="btn" onClick={reset}>Clear filters</button>}
      </div>
    </div>
  )
}
