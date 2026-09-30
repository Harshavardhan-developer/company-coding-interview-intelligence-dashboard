import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { useDataset } from './hooks/useDataset'
import { LoadingState, ErrorState } from './components/common/States'
import { QuestionDrawer } from './components/common/QuestionDrawer'

const page = (loader) => lazy(loader)
const Dashboard = page(() => import('./pages/Dashboard'))
const Companies = page(() => import('./pages/Companies'))
const CompanyDetails = page(() => import('./pages/CompanyDetails'))
const Questions = page(() => import('./pages/Questions'))
const Topics = page(() => import('./pages/Topics'))
const Compare = page(() => import('./pages/Compare'))
const Matrices = page(() => import('./pages/Matrices'))
const Difficulty = page(() => import('./pages/Difficulty'))
const Recency = page(() => import('./pages/Recency'))
const Preparation = page(() => import('./pages/Preparation'))
const DataQuality = page(() => import('./pages/DataQuality'))
const Methodology = page(() => import('./pages/Methodology'))

export default function App() {
  const { status, message, retry } = useDataset()
  if (status === 'error') return <ErrorState message={message} onRetry={retry} />
  return (
    <Layout>
      {status === 'loading' ? <LoadingState /> : (
        <Suspense fallback={<LoadingState label="Loading page…" />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:name" element={<CompanyDetails />} />
            <Route path="/questions" element={<Questions mode="explorer" />} />
            <Route path="/repeated" element={<Questions mode="repeated" />} />
            <Route path="/common" element={<Questions mode="common" />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/matrices" element={<Matrices />} />
            <Route path="/difficulty" element={<Difficulty />} />
            <Route path="/recency" element={<Recency />} />
            <Route path="/preparation" element={<Preparation />} />
            <Route path="/data-quality" element={<DataQuality />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      )}
      <QuestionDrawer />
    </Layout>
  )
}
