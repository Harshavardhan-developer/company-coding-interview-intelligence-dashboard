import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useDataset } from '../hooks/useDataset'
import { PageHeader, Callout } from '../components/common/Cards'
import { Tabs, SearchBar, Select, Pagination } from '../components/common/Controls'
import { Heatmap } from '../components/charts/Heatmap'
import { EmptyState } from '../components/common/States'
import { TOPIC_NAMES } from '../utils/topics'
import { prettyCompany } from '../utils/stats'

function CompanyTopic() {
  const { companies } = useDataset()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState('')
  const [limit, setLimit] = useState(40)
  const columns = topic ? [topic] : TOPIC_NAMES.filter((t) => companies.some((c) => c.topicCounts[t]))
  const rows = useMemo(() => companies
    .filter((c) => !search || prettyCompany(c.name).toLowerCase().includes(search.toLowerCase()))
    .filter((c) => !topic || c.topicCounts[topic])
    .map((c) => ({ key: c.name, label: prettyCompany(c.name), values: c.topicCounts, total: topic ? c.topicCounts[topic] : c.total }))
    .sort((a, b) => b.total - a.total).slice(0, limit), [companies, search, topic, limit])
  return (
    <>
      <div className="card mb-4 flex flex-wrap items-end gap-3 p-4"><div className="min-w-[14rem]"><SearchBar value={search} onChange={setSearch} placeholder="Search company…" label="Search company" /></div>
        <Select label="Topic (inferred)" allLabel="All topics" value={topic} onChange={setTopic} options={TOPIC_NAMES} />
        <Select label="Rows" allLabel="40" value={String(limit)} onChange={(v) => setLimit(Number(v) || 40)} options={['40', '100', '200']} /></div>
      <Heatmap rows={rows} columns={columns} suffixHeader="Total" onRowClick={(r) => navigate(`/companies/${r.key}`)} onCellClick={(r, c) => navigate(`/questions?company=${r.key}&topic=${encodeURIComponent(c)}`)} />
      <p className="muted mt-2 text-xs">Sorted by total questions. A question counts toward every inferred topic it matches, so row totals can be smaller than the sum of cells.</p>
    </>
  )
}

const PAGE_COLS = 12, PAGE_ROWS = 25
function CompanyQuestion() {
  const { companies, questions, openQuestion } = useDataset()
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState('')
  const [min, setMin] = useState('25')
  const [colPage, setColPage] = useState(0)
  const [rowPage, setRowPage] = useState(0)
  const rowsAll = useMemo(() => questions.filter((q) => q.companyCount >= Number(min || 1) && (!topic || q.topics.includes(topic)) && (!search || q.title.toLowerCase().includes(search.toLowerCase()))).sort((a, b) => b.companyCount - a.companyCount), [questions, min, topic, search])
  // Columns are the companies that cover the most of the currently filtered questions.
  const cols = useMemo(() => {
    const ids = new Set(rowsAll.map((q) => q.id))
    return companies.map((c) => ({ name: c.name, hits: [...c.questionIds].filter((id) => ids.has(id)).length })).filter((c) => c.hits).sort((a, b) => b.hits - a.hits)
  }, [companies, rowsAll])
  const setP = (fn) => (v) => { fn(v); setRowPage(0); setColPage(0) }
  const visCols = cols.slice(colPage * PAGE_COLS, (colPage + 1) * PAGE_COLS)
  const visRows = rowsAll.slice(rowPage * PAGE_ROWS, (rowPage + 1) * PAGE_ROWS)
  const companySets = useMemo(() => new Map(companies.map((c) => [c.name, c.questionIds])), [companies])
  return (
    <>
      <div className="card mb-4 flex flex-wrap items-end gap-3 p-4"><div className="min-w-[14rem]"><SearchBar value={search} onChange={setP(setSearch)} placeholder="Filter questions…" label="Filter questions" /></div>
        <Select label="Topic (inferred)" allLabel="All topics" value={topic} onChange={setP(setTopic)} options={TOPIC_NAMES} />
        <Select label="Min companies" allLabel="1" value={min} onChange={setP(setMin)} options={['5', '10', '25', '50', '100']} /></div>
      {!visRows.length ? <EmptyState /> : (
        <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full border-collapse text-xs">
          <thead><tr><th className="th sticky left-0 bg-slate-50 dark:bg-slate-900">Question</th>{visCols.map((c) => <th key={c.name} scope="col" className="th text-center" title={prettyCompany(c.name)}><span className="block max-w-[72px] truncate">{prettyCompany(c.name)}</span></th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{visRows.map((q) => (
            <tr key={q.id}><th scope="row" className="sticky left-0 max-w-[260px] truncate bg-white px-3 py-1.5 text-left font-medium dark:bg-slate-900"><button className="link" onClick={() => openQuestion(q.id)}>{q.title}</button></th>
              {visCols.map((c) => <td key={c.name} className="px-1 py-1.5 text-center">{companySets.get(c.name).has(q.id) ? <Check className="mx-auto h-4 w-4 text-brand-600" aria-label="asked" /> : <span className="sr-only">not asked</span>}</td>)}</tr>))}</tbody></table></div>
          <Pagination page={rowPage} pageCount={Math.ceil(rowsAll.length / PAGE_ROWS)} total={rowsAll.length} pageSize={PAGE_ROWS} onChange={setRowPage} /></div>)}
      <div className="mt-3 flex items-center gap-3"><span className="muted text-sm">Companies {cols.length ? colPage * PAGE_COLS + 1 : 0}–{Math.min(cols.length, (colPage + 1) * PAGE_COLS)} of {cols.length}</span>
        <button className="btn" disabled={colPage === 0} onClick={() => setColPage(colPage - 1)}>Previous companies</button><button className="btn" disabled={(colPage + 1) * PAGE_COLS >= cols.length} onClick={() => setColPage(colPage + 1)}>Next companies</button></div>
      <div className="mt-3"><Callout>Only a page of companies and questions is rendered at a time to keep the matrix fast. Companies are ordered by how many of the filtered questions they cover.</Callout></div>
    </>
  )
}

export default function Matrices() {
  const [tab, setTab] = useState('topic')
  return (<><PageHeader title="Matrices" description="Interactive company × topic heatmap and company × question grid." />
    <Tabs value={tab} onChange={setTab} tabs={[{ value: 'topic', label: 'Company × Topic' }, { value: 'question', label: 'Company × Question' }]} />
    {tab === 'topic' ? <CompanyTopic /> : <CompanyQuestion />}</>)
}
