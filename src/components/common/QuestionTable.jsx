import { DataTable } from '../tables/DataTable'
import { DifficultyBadge, RecencyBadge, PriorityBadge, TopicChip } from './Badges'
import { BUCKET_RANK } from '../../constants'
import { fmt } from '../../utils/stats'
import { useDataset } from '../../hooks/useDataset'
import { NOT_AVAILABLE } from '../../constants'

const DIFF_RANK = { Easy: 1, Medium: 2, Hard: 3 }

/** Shared question table. `extra` adds columns; `showRank` prepends the position. */
export function QuestionTable({ rows, defaultSort = { key: 'companyCount', dir: 'desc' }, showRank = false, pageSize = 15, extra = [], caption }) {
  const { openQuestion, companies } = useDataset()
  const columns = [
    ...(showRank ? [{ key: 'rank', label: '#', sortable: false, render: (_, rank) => <span className="muted tabular-nums">{rank}</span> }] : []),
    { key: 'title', label: 'Question', render: (q) => <button className="link text-left" onClick={(e) => { e.stopPropagation(); openQuestion(q.id) }}>{q.title} <span className="muted font-normal">#{q.id}</span></button> },
    { key: 'difficulty', label: 'Difficulty', sortValue: (q) => DIFF_RANK[q.difficulty], render: (q) => <DifficultyBadge value={q.difficulty} /> },
    { key: 'companyCount', label: 'Companies', align: 'right', render: (q) => (
      <div className="flex items-center justify-end gap-2"><span>{q.companyCount}</span>
        <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 sm:block" aria-hidden><span className="block h-full bg-brand-500" style={{ width: `${(q.companyCount / companies.length) * 100 * 4}%`, maxWidth: '100%' }} /></span></div>) },
    { key: 'acceptance', label: 'Acceptance', align: 'right', render: (q) => `${fmt(q.acceptance)}%` },
    { key: 'frequency', label: 'Frequency', align: 'right', render: (q) => (q.frequency == null ? <span title={NOT_AVAILABLE}>—</span> : `${fmt(q.frequency)}%`) },
    { key: 'topic', label: 'Topic', render: (q) => <TopicChip>{q.topic}</TopicChip> },
    { key: 'bucket', label: 'Recency', sortValue: (q) => BUCKET_RANK[q.bucket], render: (q) => <RecencyBadge value={q.bucket} /> },
    { key: 'priority', label: 'Priority', align: 'right', render: (q) => <PriorityBadge value={q.priority} /> },
    ...extra,
  ]
  return <DataTable caption={caption} columns={columns} rows={rows} rowKey={(q) => q.id} defaultSort={defaultSort} pageSize={pageSize} onRowClick={(q) => openQuestion(q.id)} />
}
