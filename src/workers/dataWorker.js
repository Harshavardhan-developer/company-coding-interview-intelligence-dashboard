// Parses the normalized records.csv off the main thread and builds every aggregate the UI needs.
import Papa from 'papaparse'
import { inferTopics } from '../utils/topics'
import { BUCKET_RANK, BUCKETS, RECENT_BUCKETS } from '../constants'
import { mean, median, countBy } from '../utils/stats'

const SHARING_TIERS = [2, 3, 5, 10, 25, 50, 100]

function buildQuestions(rows) {
  const byId = new Map()
  for (const row of rows) {
    let q = byId.get(row.problemId)
    if (!q) {
      const { topics, primary } = inferTopics(row.title)
      q = { id: row.problemId, title: row.title, url: row.url, difficulty: row.difficulty, topics, topic: primary, acceptances: [], frequencies: [], companies: [], bucket: 'unspecified', buckets: {} }
      byId.set(row.problemId, q)
    }
    q.acceptances.push(row.acceptance)
    if (row.frequency !== null) q.frequencies.push(row.frequency)
    q.companies.push(row.company)
    q.buckets[row.bucket] = (q.buckets[row.bucket] || 0) + 1
    if (BUCKET_RANK[row.bucket] > BUCKET_RANK[q.bucket]) q.bucket = row.bucket
  }
  return [...byId.values()].map(({ acceptances, frequencies, ...q }) => ({
    ...q,
    companyCount: q.companies.length,
    acceptance: mean(acceptances),
    frequency: frequencies.length ? mean(frequencies) : null, // mean of each company's all.csv frequency
    maxFrequency: frequencies.length ? Math.max(...frequencies) : null,
  }))
}

function buildCompanies(rows, questionById) {
  const byCompany = new Map()
  for (const row of rows) {
    if (!byCompany.has(row.company)) byCompany.set(row.company, [])
    byCompany.get(row.company).push({ id: row.problemId, frequency: row.frequency, bucket: row.bucket, acceptance: row.acceptance })
  }
  return [...byCompany].map(([name, records]) => {
    const qs = records.map((r) => questionById.get(r.id))
    const acceptance = records.map((r) => r.acceptance)
    const freq = records.map((r) => r.frequency).filter((f) => f !== null)
    const difficulty = countBy(qs, (q) => q.difficulty)
    const bucketCounts = Object.fromEntries(BUCKETS.map((b) => [b, records.filter((r) => r.bucket === b).length]))
    const topicCounts = {}
    for (const q of qs) for (const t of q.topics) topicCounts[t] = (topicCounts[t] || 0) + 1
    const sharing = { specific: qs.filter((q) => q.companyCount === 1).length }
    for (const tier of SHARING_TIERS) sharing[tier] = qs.filter((q) => q.companyCount >= tier).length
    const total = records.length
    return {
      name, records, total,
      easy: difficulty.Easy || 0, medium: difficulty.Medium || 0, hard: difficulty.Hard || 0,
      avgAcceptance: mean(acceptance), medianAcceptance: median(acceptance),
      minAcceptance: Math.min(...acceptance), maxAcceptance: Math.max(...acceptance),
      avgFrequency: mean(freq), maxFrequency: freq.length ? Math.max(...freq) : null,
      bucketCounts, recent: RECENT_BUCKETS.reduce((s, b) => s + bucketCounts[b], 0),
      topicCounts, sharing,
      questionIds: new Set(records.map((r) => r.id)),
    }
  })
}

self.onmessage = async ({ data: { recordsUrl, qualityUrl } }) => {
  try {
    const [csv, quality] = await Promise.all([
      fetch(recordsUrl).then((r) => { if (!r.ok) throw new Error(`records.csv: HTTP ${r.status}`); return r.text() }),
      fetch(qualityUrl).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
    const { data } = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true })
    const rows = data.map((r) => ({ ...r, frequency: typeof r.frequency === 'number' ? r.frequency : null }))
    if (!rows.length) throw new Error('records.csv is empty')
    const questions = buildQuestions(rows)
    const questionById = new Map(questions.map((q) => [q.id, q]))
    const companies = buildCompanies(rows, questionById)
    // Sets do not survive JSON but do survive structured clone, so they are posted as-is.
    self.postMessage({ ok: true, rows: rows.length, questions, companies, quality })
  } catch (error) {
    self.postMessage({ ok: false, message: error.message })
  }
}
