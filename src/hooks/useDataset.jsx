import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { priorityScore, DEFAULT_WEIGHTS } from '../utils/priority'
import { computeTopicStats } from '../utils/analytics'

const DatasetContext = createContext(null)
export const useDataset = () => useContext(DatasetContext)

export function DatasetProvider({ children }) {
  const [state, setState] = useState({ status: 'loading' })
  const [openId, setOpenId] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setState({ status: 'loading' })
    const worker = new Worker(new URL('../workers/dataWorker.js', import.meta.url), { type: 'module' })
    const base = document.baseURI
    worker.onmessage = ({ data }) => {
      setState(data.ok ? { status: 'ready', raw: data } : { status: 'error', message: data.message })
      worker.terminate()
    }
    worker.onerror = (e) => { setState({ status: 'error', message: e.message || 'Worker failed' }); worker.terminate() }
    worker.postMessage({ recordsUrl: new URL('dataset/records.csv', base).href, qualityUrl: new URL('dataset/quality.json', base).href })
    return () => worker.terminate()
  }, [attempt])

  const derived = useMemo(() => {
    if (state.status !== 'ready') return null
    const { questions: rawQuestions, companies, quality, rows } = state.raw
    const maxCompanyCount = Math.max(...rawQuestions.map((q) => q.companyCount))
    // Priority here uses the default weights; the planner recomputes with user weights.
    const questions = rawQuestions.map((q) => ({ ...q, priority: priorityScore(q, DEFAULT_WEIGHTS, maxCompanyCount) }))
    const questionById = new Map(questions.map((q) => [q.id, q]))
    const companyByName = new Map(companies.map((c) => [c.name, c]))
    return { questions, companies, quality, rows, maxCompanyCount, questionById, companyByName, topicStats: computeTopicStats(questions, companies) }
  }, [state])

  const openQuestion = useCallback((id) => setOpenId(id), [])
  const value = useMemo(() => ({ ...state, ...derived, openId, openQuestion, closeQuestion: () => setOpenId(null), retry: () => setAttempt((n) => n + 1) }), [state, derived, openId, openQuestion])
  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>
}
