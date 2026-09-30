import { useMemo, useState, useEffect } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { Pagination } from '../common/Controls'
import { EmptyState } from '../common/States'

/**
 * columns: [{ key, label, render?(row), sortValue?(row), align?, sortable? }]
 * Sorting and pagination happen client-side; page resets whenever the row set changes.
 */
export function DataTable({ columns, rows, rowKey, pageSize = 15, defaultSort, onRowClick, emptyTitle, caption }) {
  const [sort, setSort] = useState(defaultSort || null)
  const [page, setPage] = useState(0)
  useEffect(() => setPage(0), [rows])

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    const get = col?.sortValue || ((r) => r[sort.key])
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const x = get(a), y = get(b)
      if (x == null && y == null) return 0
      if (x == null) return 1
      if (y == null) return -1
      return (typeof x === 'string' ? x.localeCompare(y) : x - y) * dir
    })
  }, [rows, sort, columns])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const visible = sorted.slice(page * pageSize, (page + 1) * pageSize)
  const toggle = (key) => setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))

  if (!rows.length) return <div className="card"><EmptyState title={emptyTitle} /></div>
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key
                return (
                  <th key={c.key} scope="col" className={`th ${c.align === 'right' ? 'text-right' : ''}`} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    {c.sortable === false ? c.label : (
                      <button className="inline-flex items-center gap-1 uppercase tracking-wide" onClick={() => toggle(c.key)}>
                        {c.label}{active ? (sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ChevronsUpDown className="h-3 w-3 opacity-40" />}
                      </button>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((row, i) => (
              <tr key={rowKey(row)} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick?.(row)}>
                {columns.map((c) => <td key={c.key} className={`td ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>{c.render ? c.render(row, page * pageSize + i + 1) : row[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} total={sorted.length} pageSize={pageSize} onChange={setPage} />
    </div>
  )
}
