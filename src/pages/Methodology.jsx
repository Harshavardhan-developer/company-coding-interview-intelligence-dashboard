import { PageHeader } from '../components/common/Cards'
import { useDataset } from '../hooks/useDataset'
import { DEFAULT_WEIGHTS } from '../utils/priority'
import { TOPIC_NAMES } from '../utils/topics'
import { RECENCY_SCORE } from '../constants'

export default function Methodology() {
  const { companies, questions, rows, quality } = useDataset()
  const items = [
    ['1. Dataset snapshot', `The supplied ZIP contains ${quality?.sourceFiles ?? '—'} CSV files for ${companies.length} companies, reduced to ${rows.toLocaleString()} company-question records covering ${questions.length.toLocaleString()} unique problems. The raw files remain in data/raw for provenance.`],
    ['2. Source files', 'Each company folder can hold all.csv, thirty-days.csv, three-months.csv, six-months.csv and more-than-six-months.csv. Columns: ID, URL, Title, Difficulty, Acceptance %, Frequency %.'],
    ['3. Normalization', 'scripts/build-dataset.js validates each row, merges the same company-problem pair across files, removes accidental duplicates and writes public/dataset/records.csv (company, problemId, title, url, difficulty, acceptance, frequency, sourceFile, bucket). It is a build tool, not a backend.'],
    ['4. Company extraction', 'The company is the folder name. Display names are a simple prettified version of the folder name.'],
    ['5. Recency calculation', 'thirty-days → 30d, three-months → 3m, six-months → 6m, more-than-six-months → older. A pair gets the most recent bucket it appears in (30d > 3m > 6m > older). Pairs found only in all.csv are Unspecified. Recency is never guessed. "Recent" in this app means 30d, 3m or 6m.'],
    ['6. Frequency limitations', 'Frequency values are relative to their source file. Frequency percentages must not be compared across files. The app uses the all.csv value only; pairs absent from all.csv show no frequency. A question-level frequency is the mean of its per-company all.csv values. Not available from supplied dataset where missing.'],
    ['7. Topic inference', `Topics are inferred from problem titles with ordered keyword rules (${TOPIC_NAMES.length} labels including Other). They are not official source tags, a title can match several topics, and some will be wrong. The first matching rule is the primary topic.`],
    ['8. Dataset-Based Priority', `A weighted score from 0–100 of: frequency (all.csv %), company coverage (log-scaled company count), recency (${Object.entries(RECENCY_SCORE).map(([k, v]) => `${k}=${v}`).join(', ')}) and difficulty preference. Default weights ${Object.entries(DEFAULT_WEIGHTS).map(([k, v]) => `${k} ${v}`).join(', ')} are adjustable in the planner and re-normalised. Priority is dataset-based and not predictive. It does not predict future interviews.`],
    ['9. Missing recency', 'Unspecified means no recency file contains the pair. It says nothing about how old the question is.'],
    ['10. Data quality', 'The Data Quality page shows build-time validation plus runtime cross-checks. Acceptance is the dataset-reported metric and does not indicate interview importance.'],
  ]
  return (
    <>
      <PageHeader title="Methodology" description="How every number in this app is produced." />
      <div className="card space-y-5 p-5">{items.map(([h, t]) => <section key={h}><h2 className="text-sm font-semibold">{h}</h2><p className="muted mt-1 leading-relaxed">{t}</p></section>)}</div>
      <p className="mt-4 text-sm font-medium">Topics are inferred from problem titles. Priority is dataset-based and not predictive. Frequency values are relative to their source files.</p>
    </>
  )
}
