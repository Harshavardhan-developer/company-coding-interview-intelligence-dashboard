// Build-time only: reads raw company CSVs -> normalized public/dataset/records.csv (+ quality.json).
// This is a development tool, not a backend.
import fs from 'node:fs'
import path from 'node:path'
import Papa from 'papaparse'

const RAW_DIR = path.resolve('data/raw')
const OUT_DIR = path.resolve('public/dataset')
const BUCKET_BY_FILE = {
  'thirty-days.csv': '30d',
  'three-months.csv': '3m',
  'six-months.csv': '6m',
  'more-than-six-months.csv': 'older',
}
const BUCKET_RANK = { '30d': 4, '3m': 3, '6m': 2, older: 1, unspecified: 0 }
const REQUIRED = ['ID', 'URL', 'Title', 'Difficulty', 'Acceptance %', 'Frequency %']
const DIFFICULTIES = new Set(['Easy', 'Medium', 'Hard'])

const issues = { missingColumns: [], missingValues: 0, invalidDifficulty: 0, invalidAcceptance: 0, invalidFrequency: 0, invalidUrl: 0, invalidId: 0, duplicateRowsInFile: 0 }
const pct = (v) => { const n = parseFloat(String(v ?? '').replace('%', '')); return Number.isFinite(n) ? n : NaN }

const companies = fs.readdirSync(RAW_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.readdirSync(path.join(RAW_DIR, d.name)).some((f) => f.endsWith('.csv')))
  .map((d) => d.name).sort()

const pairs = new Map() // "company|id" -> record
const recordsByFile = {}
const titlesById = new Map()
const urlsById = new Map()
let sourceFiles = 0, rawRows = 0

for (const company of companies) {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(company)) issues.invalidCompany = (issues.invalidCompany || 0) + 1
  const files = fs.readdirSync(path.join(RAW_DIR, company)).filter((f) => f.endsWith('.csv'))
  for (const file of files) {
    sourceFiles++
    const text = fs.readFileSync(path.join(RAW_DIR, company, file), 'utf8')
    const { data, meta } = Papa.parse(text, { header: true, skipEmptyLines: true })
    const missing = REQUIRED.filter((c) => !meta.fields.includes(c))
    if (missing.length) { issues.missingColumns.push({ company, file, missing }); continue }
    const seenInFile = new Set()
    for (const row of data) {
      rawRows++
      recordsByFile[file] = (recordsByFile[file] || 0) + 1
      const id = parseInt(row.ID, 10)
      const title = (row.Title || '').trim()
      const url = (row.URL || '').trim()
      const difficulty = (row.Difficulty || '').trim()
      const acceptance = pct(row['Acceptance %'])
      const frequency = pct(row['Frequency %'])
      if (!title || !url || !row.ID) { issues.missingValues++; continue }
      if (!Number.isInteger(id)) { issues.invalidId++; continue }
      if (!DIFFICULTIES.has(difficulty)) { issues.invalidDifficulty++; continue }
      if (!(acceptance >= 0 && acceptance <= 100)) { issues.invalidAcceptance++; continue }
      if (!(frequency >= 0 && frequency <= 100)) { issues.invalidFrequency++; continue }
      if (!/^https?:\/\//.test(url)) { issues.invalidUrl++; continue }
      if (seenInFile.has(id)) { issues.duplicateRowsInFile++; continue }
      seenInFile.add(id)

      if (!titlesById.has(id)) titlesById.set(id, new Set())
      titlesById.get(id).add(title)
      if (!urlsById.has(id)) urlsById.set(id, new Set())
      urlsById.get(id).add(url)

      const key = `${company}|${id}`
      const rec = pairs.get(key) || { company, problemId: id, title, url, difficulty, acceptance, frequency: '', sources: [], bucket: 'unspecified' }
      rec.sources.push(file)
      if (file === 'all.csv') { rec.frequency = frequency; rec.acceptance = acceptance }
      else if (BUCKET_BY_FILE[file] && BUCKET_RANK[BUCKET_BY_FILE[file]] > BUCKET_RANK[rec.bucket]) rec.bucket = BUCKET_BY_FILE[file]
      pairs.set(key, rec)
    }
  }
}

const rows = [...pairs.values()].sort((a, b) => a.company.localeCompare(b.company) || a.problemId - b.problemId)
const out = rows.map((r) => ({ company: r.company, problemId: r.problemId, title: r.title, url: r.url, difficulty: r.difficulty, acceptance: r.acceptance, frequency: r.frequency, sourceFile: r.sources.join('|'), bucket: r.bucket }))
fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(path.join(OUT_DIR, 'records.csv'), Papa.unparse(out))

const quality = {
  sourceFiles,
  rawRows,
  normalizedRecords: rows.length,
  rowsMergedAcrossSourceFiles: rawRows - rows.length - Object.entries(issues).filter(([k]) => !['missingColumns', 'duplicateRowsInFile'].includes(k)).reduce((s, [, v]) => s + (typeof v === 'number' ? v : 0), 0),
  duplicateRowsInFile: issues.duplicateRowsInFile,
  companies: companies.length,
  uniqueProblems: titlesById.size,
  recordsWithoutAllCsv: rows.filter((r) => r.frequency === '').length,
  recordsByFile,
  issues,
  conflictingTitles: [...titlesById].filter(([, s]) => s.size > 1).map(([id, s]) => ({ id, values: [...s] })),
  conflictingUrls: [...urlsById].filter(([, s]) => s.size > 1).map(([id, s]) => ({ id, values: [...s] })),
  generatedFrom: 'data/raw',
}
fs.writeFileSync(path.join(OUT_DIR, 'quality.json'), JSON.stringify(quality, null, 1))

console.log('--- Dataset build summary ---')
console.log(`companies: ${quality.companies} | source files: ${sourceFiles} | raw rows: ${rawRows}`)
console.log(`normalized company-question records: ${rows.length} | unique problems: ${quality.uniqueProblems}`)
console.log('validation issues:', JSON.stringify(issues))
console.log(`conflicting titles: ${quality.conflictingTitles.length} | conflicting urls: ${quality.conflictingUrls.length}`)
if (issues.missingColumns.length) { console.error('Missing required columns detected'); process.exit(1) }
