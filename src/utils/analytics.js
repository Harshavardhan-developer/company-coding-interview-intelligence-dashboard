import { mean, countBy } from './stats'
import { RECENT_BUCKETS } from '../constants'

/** Per-topic aggregates. A question counts toward every inferred topic it matches. */
export function computeTopicStats(questions, companies) {
  const map = new Map()
  for (const q of questions) {
    for (const topic of q.topics) {
      if (!map.has(topic)) map.set(topic, { topic, questions: [], companies: new Set() })
      const entry = map.get(topic)
      entry.questions.push(q)
      q.companies.forEach((c) => entry.companies.add(c))
    }
  }
  return [...map.values()].map(({ topic, questions: qs, companies: set }) => {
    const difficulty = countBy(qs, (q) => q.difficulty)
    return {
      topic, total: qs.length, companyCount: set.size, companies: [...set],
      coverage: (set.size / companies.length) * 100,
      avgAcceptance: mean(qs.map((q) => q.acceptance)),
      avgFrequency: mean(qs.filter((q) => q.frequency !== null).map((q) => q.frequency)),
      recent: qs.filter((q) => RECENT_BUCKETS.includes(q.bucket)).length,
      easy: difficulty.Easy || 0, medium: difficulty.Medium || 0, hard: difficulty.Hard || 0,
      questions: [...qs].sort((a, b) => b.companyCount - a.companyCount),
    }
  }).sort((a, b) => b.total - a.total)
}

/** Companies sharing questions with `company`, sorted by shared question count. */
export function computeOverlap(company, companies, questionById) {
  const topicsOf = (c) => new Set(Object.keys(c.topicCounts))
  const mine = topicsOf(company)
  return companies.filter((c) => c.name !== company.name).map((other) => {
    let shared = 0
    for (const id of company.questionIds) if (other.questionIds.has(id)) shared++
    const union = company.total + other.total - shared
    const sharedTopics = [...topicsOf(other)].filter((t) => mine.has(t)).length
    return { name: other.name, shared, sharedTopics, jaccard: union ? shared / union : 0, total: other.total }
  }).filter((r) => r.shared > 0).sort((a, b) => b.shared - a.shared)
}

import { priorityScore } from './priority'

/** Company-scoped question rows: frequency and recency come from THIS company's records. */
export function companyQuestions(company, questionById, weights, maxCompanyCount, preferredDifficulty = 'Any') {
  return company.records.map((r) => {
    const q = questionById.get(r.id)
    const row = { ...q, frequency: r.frequency, bucket: r.bucket, acceptance: r.acceptance }
    return { ...row, priority: priorityScore(row, weights, maxCompanyCount, preferredDifficulty) }
  })
}
