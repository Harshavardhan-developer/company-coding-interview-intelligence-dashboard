export const sum = (values) => values.reduce((total, v) => total + v, 0)
export const mean = (values) => (values.length ? sum(values) / values.length : null)
export function median(values) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
export const countBy = (items, getKey) => {
  const counts = {}
  for (const item of items) { const key = getKey(item); counts[key] = (counts[key] || 0) + 1 }
  return counts
}
/** Fixed-width histogram: [{ label, count, from, to }] */
export function histogram(values, binSize = 10, max = 100) {
  const bins = Array.from({ length: Math.ceil(max / binSize) }, (_, i) => ({ from: i * binSize, to: (i + 1) * binSize, label: `${i * binSize}–${(i + 1) * binSize}`, count: 0 }))
  for (const v of values) bins[Math.min(Math.floor(v / binSize), bins.length - 1)].count++
  return bins
}
export const fmt = (n, digits = 1) => (n == null || Number.isNaN(n) ? '—' : Number(n).toFixed(digits))
export const fmtInt = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'))
const ACRONYMS = /^(ibm|sap|hp|ea|tcs|hsbc|ust|ola|rbc|cme|nyu|ucsd|zs)$/
export const prettyCompany = (slug) => slug.split(/[-_]/).map((w) => (ACRONYMS.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))).join(' ')
