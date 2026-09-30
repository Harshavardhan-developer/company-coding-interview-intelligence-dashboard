export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
export const DIFFICULTY_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' }

// Ordered from most to least recent.
export const BUCKETS = ['30d', '3m', '6m', 'older', 'unspecified']
export const BUCKET_RANK = { '30d': 4, '3m': 3, '6m': 2, older: 1, unspecified: 0 }
export const BUCKET_LABELS = { '30d': 'Last 30 days', '3m': 'Last 3 months', '6m': 'Last 6 months', older: 'Older than 6 months', unspecified: 'Unspecified' }
export const BUCKET_COLORS = { '30d': '#6366f1', '3m': '#8b5cf6', '6m': '#0ea5e9', older: '#94a3b8', unspecified: '#cbd5e1' }
// Recent = appears in any of the three recency files covering the last 6 months.
export const RECENT_BUCKETS = ['30d', '3m', '6m']

// Recency contribution to Dataset-Based Priority (0..1), derived from bucket order.
export const RECENCY_SCORE = { '30d': 1, '3m': 0.75, '6m': 0.5, older: 0.25, unspecified: 0 }

export const CHART_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b']
export const FREQUENCY_NOTE = 'Frequency is relative to each source file and is not comparable across files. Dataset frequency here is the value reported in all.csv.'
export const PRIORITY_NOTE = 'This score summarizes patterns present in the supplied dataset. It does not predict future interviews.'
export const NOT_AVAILABLE = 'Not available from supplied dataset.'
