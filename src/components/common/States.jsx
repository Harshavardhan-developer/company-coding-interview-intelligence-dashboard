import { Loader2, AlertTriangle, SearchX } from 'lucide-react'

export const LoadingState = ({ label = 'Loading dataset…' }) => (
  <div role="status" className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500"><Loader2 className="h-7 w-7 animate-spin" /><p className="text-sm">{label}</p></div>
)
export const EmptyState = ({ title = 'No matching questions found.', hint = 'Try clearing a filter or broadening your search.' }) => (
  <div className="flex flex-col items-center gap-2 py-14 text-center"><SearchX className="h-7 w-7 text-slate-400" aria-hidden /><p className="font-medium">{title}</p><p className="muted">{hint}</p></div>
)
export const ErrorState = ({ message, onRetry }) => (
  <div role="alert" className="mx-auto mt-24 max-w-md text-center"><AlertTriangle className="mx-auto h-9 w-9 text-red-500" aria-hidden />
    <h1 className="mt-3 text-lg font-semibold">The dataset could not be loaded</h1>
    <p className="muted mt-1">{message}</p><p className="muted mt-1">Run <code>npm run build:data</code> to regenerate <code>public/dataset/records.csv</code>.</p>
    {onRetry && <button className="btn btn-primary mt-4" onClick={onRetry}>Try again</button>}</div>
)
