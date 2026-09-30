import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataset } from '../hooks/useDataset'
import { PageHeader, ChartCard, Callout } from '../components/common/Cards'
import { Tabs, CompanySelector } from '../components/common/Controls'
import { Columns, BarList } from '../components/charts/Charts'
import { QuestionTable } from '../components/common/QuestionTable'
import { DataTable } from '../components/tables/DataTable'
import { EmptyState } from '../components/common/States'
import { computeOverlap } from '../utils/analytics'
import { CHART_COLORS } from '../constants'
import { fmt, prettyCompany } from '../utils/stats'

function Comparison() {
  const { companies, companyByName, questionById } = useDataset()
  const [sel, setSel] = useState(['', '', ''])
  const chosen = sel.filter(Boolean).map((n) => companyByName.get(n))
  const setAt = (i) => (v) => setSel((s) => s.map((x, j) => (j === i ? v : x)))

  const result = useMemo(() => {
    if (chosen.length < 2) return null
    const inAll = [...chosen[0].questionIds].filter((id) => chosen.every((c) => c.questionIds.has(id)))
    const unique = chosen.map((c) => [...c.questionIds].filter((id) => chosen.every((o) => o === c || !o.questionIds.has(id))))
    const topicSets = chosen.map((c) => new Set(Object.keys(c.topicCounts)))
    const allTopics = [...new Set(chosen.flatMap((c) => Object.keys(c.topicCounts)))]
    const sharedTopics = allTopics.filter((t) => topicSets.every((s) => s.has(t)))
    return { inAll, unique, sharedTopics, allTopics }
  }, [chosen.map((c) => c.name).join()])  // eslint-disable-line

  const metrics = [['Total questions', (c) => c.total], ['Easy', (c) => c.easy], ['Medium', (c) => c.medium], ['Hard', (c) => c.hard], ['Recent questions', (c) => c.recent], ['Avg acceptance %', (c) => fmt(c.avgAcceptance)], ['Avg frequency % (all.csv)', (c) => (c.avgFrequency == null ? '—' : fmt(c.avgFrequency))]]
  const toRows = (ids) => ids.map((id) => questionById.get(id))
  return (
    <>
      <div className="card mb-4 flex flex-wrap gap-3 p-4">
        {['Company A', 'Company B', 'Company C (optional)'].map((l, i) => <CompanySelector key={l} label={l} companies={companies} value={sel[i]} onChange={setAt(i)} />)}
      </div>
      {!result ? <EmptyState title="Select at least two companies." hint="Choose Company A and Company B to compare them." /> : (
        <>
          <div className="card mb-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="th">Metric</th>{chosen.map((c) => <th key={c.name} className="th text-right"><Link className="link" to={`/companies/${c.name}`}>{prettyCompany(c.name)}</Link></th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {metrics.map(([label, fn]) => <tr key={label}><th scope="row" className="td text-left font-medium">{label}</th>{chosen.map((c) => <td key={c.name} className="td text-right tabular-nums">{fn(c)}</td>)}</tr>)}
              <tr><th scope="row" className="td text-left font-medium">Unique to this company (vs. selected)</th>{result.unique.map((u, i) => <td key={i} className="td text-right tabular-nums">{u.length}</td>)}</tr>
              <tr><th scope="row" className="td text-left font-medium">Shared by all selected</th>{chosen.map((c) => <td key={c.name} className="td text-right tabular-nums">{result.inAll.length}</td>)}</tr></tbody></table></div>
          <ChartCard title="Topic differences (inferred)" subtitle={`${result.sharedTopics.length} of ${result.allTopics.length} topics appear in all selected companies`} height={360}>
            <Columns data={result.allTopics.map((t) => ({ name: t, ...Object.fromEntries(chosen.map((c) => [prettyCompany(c.name), c.topicCounts[t] || 0])) }))} series={chosen.map((c, i) => ({ key: prettyCompany(c.name), color: CHART_COLORS[i] }))} /></ChartCard>
          <h2 className="mb-2 mt-6 text-base font-semibold">Shared questions ({result.inAll.length})</h2>
          <QuestionTable rows={toRows(result.inAll)} pageSize={8} caption="Shared questions" />
          {chosen.map((c, i) => <div key={c.name}><h2 className="mb-2 mt-6 text-base font-semibold">{prettyCompany(c.name)} unique questions ({result.unique[i].length})</h2><QuestionTable rows={toRows(result.unique[i])} pageSize={8} caption={`${c.name} unique questions`} /></div>)}
        </>
      )}
    </>
  )
}

function Overlap() {
  const { companies, companyByName, questionById } = useDataset()
  const [name, setName] = useState('')
  const company = companyByName.get(name)
  const rows = useMemo(() => (company ? computeOverlap(company, companies, questionById) : []), [company, companies, questionById])
  return (
    <>
      <div className="card mb-4 flex flex-wrap items-end gap-3 p-4"><CompanySelector companies={companies} value={name} onChange={setName} /><Callout>Descriptive overlap only. This is not a ranking of companies.</Callout></div>
      {!company ? <EmptyState title="Select a company to see overlap." hint="" /> : (
        <>
          <ChartCard title={`Companies sharing the most questions with ${prettyCompany(company.name)}`} subtitle="Top 15 by shared question count" height={440}><BarList data={rows.slice(0, 15).map((r) => ({ name: prettyCompany(r.name), value: r.shared }))} valueLabel="Shared questions" nameWidth={140} /></ChartCard>
          <div className="mt-4"><DataTable caption="Company overlap" rows={rows} rowKey={(r) => r.name} pageSize={12} defaultSort={{ key: 'shared', dir: 'desc' }}
            columns={[{ key: 'name', label: 'Company', render: (r) => <Link className="link" to={`/companies/${r.name}`}>{prettyCompany(r.name)}</Link> }, { key: 'shared', label: 'Shared questions', align: 'right' }, { key: 'sharedTopics', label: 'Shared topics', align: 'right' }, { key: 'jaccard', label: 'Overlap (Jaccard) %', align: 'right', render: (r) => fmt(r.jaccard * 100) }, { key: 'total', label: 'Their total', align: 'right' }]} /></div>
        </>
      )}
    </>
  )
}

export default function Compare() {
  const [tab, setTab] = useState('compare')
  return (
    <>
      <PageHeader title="Company Comparison & Overlap" description="Compare up to three companies, or see which companies overlap most with one." />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'compare', label: 'Compare companies' }, { value: 'overlap', label: 'Overlap network' }]} />
      {tab === 'compare' ? <Comparison /> : <Overlap />}
    </>
  )
}
