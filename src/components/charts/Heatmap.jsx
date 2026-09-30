import { EmptyState } from '../common/States'

/** rows: [{ key, label, values: { [col]: number }, total }]. Cell shade is scaled by the max value. */
export function Heatmap({ rows, columns, onRowClick, onCellClick, rowHeader = 'Company', suffixHeader }) {
  if (!rows.length) return <EmptyState />
  const max = Math.max(1, ...rows.flatMap((r) => columns.map((c) => r.values[c] || 0)))
  return (
    <div className="overflow-auto rounded-lg border border-slate-200 dark:border-slate-800" style={{ maxHeight: 560 }}>
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
          <tr>
            <th scope="col" className="th sticky left-0 z-20 bg-slate-50 dark:bg-slate-900">{rowHeader}</th>
            {columns.map((c) => <th key={c} scope="col" className="th text-center" style={{ minWidth: 64 }}><span className="block max-w-[80px] truncate" title={c}>{c}</span></th>)}
            {suffixHeader && <th scope="col" className="th text-right">{suffixHeader}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className="sticky left-0 whitespace-nowrap bg-white px-3 py-1.5 text-left font-medium dark:bg-slate-900">
                {onRowClick ? <button className="link" onClick={() => onRowClick(r)}>{r.label}</button> : r.label}
              </th>
              {columns.map((c) => {
                const v = r.values[c] || 0
                return (
                  <td key={c} className="p-0.5 text-center">
                    <button disabled={!onCellClick || !v} onClick={() => onCellClick?.(r, c)} title={`${r.label} · ${c}: ${v}`} aria-label={`${r.label}, ${c}: ${v}`}
                      className="block w-full rounded px-1 py-1 tabular-nums" style={{ background: v ? `rgba(99,102,241,${0.08 + (v / max) * 0.8})` : 'transparent', color: v / max > 0.55 ? '#fff' : undefined }}>{v || ''}</button>
                  </td>
                )
              })}
              {suffixHeader && <td className="px-3 text-right tabular-nums">{r.total}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
