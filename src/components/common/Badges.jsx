import { DIFFICULTY_COLORS, BUCKET_LABELS, BUCKET_COLORS } from '../../constants'

const pill = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium'

// Text label + dot so meaning never relies on colour alone.
export function DifficultyBadge({ value }) {
  const color = DIFFICULTY_COLORS[value]
  return <span className={`${pill} border-slate-200 dark:border-slate-700`}><span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />{value}</span>
}
export function RecencyBadge({ value }) {
  return <span className={`${pill} border-slate-200 dark:border-slate-700`}><span className="h-2 w-2 rounded-sm" style={{ background: BUCKET_COLORS[value] }} aria-hidden />{BUCKET_LABELS[value] || value}</span>
}
export function PriorityBadge({ value }) {
  const tone = value >= 70 ? 'bg-brand-50 text-brand-700 dark:bg-indigo-500/15 dark:text-indigo-300' : value >= 40 ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
  return <span className={`${pill} border-transparent tabular-nums ${tone}`} title="Dataset-Based Priority (0-100). Descriptive, not predictive.">{value.toFixed(1)}</span>
}
export const TopicChip = ({ children }) => <span className={`${pill} border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800`} title="Inferred Topic (from title)">{children}</span>
