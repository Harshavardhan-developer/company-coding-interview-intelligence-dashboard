import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { CHART_COLORS } from '../../constants'
import { EmptyState } from '../common/States'

const tick = { fontSize: 11, fill: '#94a3b8' }
const tooltipStyle = { background: 'rgba(15,23,42,.95)', border: 'none', borderRadius: 8, color: '#f8fafc', fontSize: 12 }
const tooltipProps = { contentStyle: tooltipStyle, itemStyle: { color: '#f8fafc' }, labelStyle: { color: '#cbd5e1' }, cursor: { fill: 'rgba(148,163,184,.15)' } }
const guard = (data, node) => (!data || !data.length ? <EmptyState title="Not available from supplied dataset." hint="" /> : node)

/** Horizontal ranked bars. data: [{ name, value }]. onBarClick receives the datum. */
export function BarList({ data, onBarClick, color = CHART_COLORS[0], valueLabel = 'Count', nameWidth = 130 }) {
  return guard(data, (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="rgba(148,163,184,.2)" />
        <XAxis type="number" tick={tick} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={nameWidth} tick={tick} interval={0} tickFormatter={(v) => (v.length > 20 ? v.slice(0, 19) + '…' : v)} />
        <Tooltip {...tooltipProps} formatter={(v) => [v, valueLabel]} />
        <Bar dataKey="value" name={valueLabel} fill={color} radius={[0, 4, 4, 0]} cursor={onBarClick ? 'pointer' : 'default'} onClick={(d) => onBarClick?.(d)} />
      </BarChart>
    </ResponsiveContainer>
  ))
}

/** Vertical columns with optional stacking. series: [{ key, name, color }] */
export function Columns({ data, series, xLabel, yLabel, stacked = false, onBarClick, xKey = 'name', legend }) {
  return guard(data, (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: 0, right: 8, bottom: xLabel ? 18 : 0 }}>
        <CartesianGrid vertical={false} stroke="rgba(148,163,184,.2)" />
        <XAxis dataKey={xKey} tick={tick} interval={0} angle={data.length > 8 ? -35 : 0} textAnchor={data.length > 8 ? 'end' : 'middle'} height={data.length > 8 ? 70 : 30} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -12, fill: '#94a3b8', fontSize: 11 } : undefined} />
        <YAxis tick={tick} allowDecimals={false} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 } : undefined} />
        <Tooltip {...tooltipProps} />
        {(legend ?? series.length > 1) && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.name || s.key} fill={s.color} stackId={stacked ? 'a' : undefined} cursor={onBarClick ? 'pointer' : 'default'} onClick={(d) => onBarClick?.(d, s)} />)}
      </BarChart>
    </ResponsiveContainer>
  ))
}

export function Donut({ data, onSliceClick, colors }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return guard(total ? data : [], (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2} cursor={onSliceClick ? 'pointer' : 'default'} onClick={(d) => onSliceClick?.(d)}>
          {data.map((d, i) => <Cell key={d.name} fill={d.color || colors?.[d.name] || CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip {...tooltipProps} formatter={(v, n) => [`${v.toLocaleString()} (${((v / total) * 100).toFixed(1)}%)`, n]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  ))
}
