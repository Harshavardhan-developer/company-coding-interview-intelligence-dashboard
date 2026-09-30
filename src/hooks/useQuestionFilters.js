import { useMemo, useState } from 'react'
import { BUCKET_RANK } from '../constants'

export const EMPTY_FILTERS = { search: '', difficulty: '', topic: '', company: '', recency: '', minCompanies: '', accMin: '', accMax: '', freqMin: '', freqMax: '' }

/** Filter state + memoised filtering shared by every question list. */
export function useQuestionFilters(questions, initial = {}) {
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, ...initial })
  const set = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }))
  const reset = () => setFilters({ ...EMPTY_FILTERS, ...initial })

  const filtered = useMemo(() => {
    const text = filters.search.trim().toLowerCase()
    const num = (v) => (v === '' ? null : Number(v))
    const [accMin, accMax, freqMin, freqMax, minCo] = [num(filters.accMin), num(filters.accMax), num(filters.freqMin), num(filters.freqMax), num(filters.minCompanies)]
    return questions.filter((q) => {
      if (filters.difficulty && q.difficulty !== filters.difficulty) return false
      if (filters.topic && !q.topics.includes(filters.topic)) return false
      if (filters.company && !q.companies.includes(filters.company)) return false
      if (filters.recency && q.bucket !== filters.recency) return false
      if (minCo != null && q.companyCount < minCo) return false
      if (accMin != null && q.acceptance < accMin) return false
      if (accMax != null && q.acceptance > accMax) return false
      if ((freqMin != null || freqMax != null) && q.frequency == null) return false
      if (freqMin != null && q.frequency < freqMin) return false
      if (freqMax != null && q.frequency > freqMax) return false
      if (text && !(q.title.toLowerCase().includes(text) || String(q.id) === text || q.topics.some((t) => t.toLowerCase().includes(text)) || q.companies.some((c) => c.includes(text.replace(/\s+/g, '-'))))) return false
      return true
    })
  }, [questions, filters])
  return { filters, set, reset, filtered, active: Object.entries(filters).some(([k, v]) => v !== '' && v !== (initial[k] ?? '')) }
}
export { BUCKET_RANK }
