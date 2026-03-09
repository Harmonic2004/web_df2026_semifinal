import { useState, useCallback } from 'react'
import Header from './components/Header'
import InputSection from './components/InputSection'
import PredictionOutputs from './components/PredictionOutputs'
import ExplainabilityPanel from './components/ExplainabilityPanel'
import SimilarSequences from './components/SimilarSequences'
import BatchStats from './components/BatchStats'
import BatchCharts from './components/BatchCharts'

import { usePrediction } from './hooks/usePrediction'
import { api } from './services/api'

const MAX_SEQ_LEN = 37

export default function App() {
  const { result, status, error, modelActive, runPredict } = usePrediction()
  const [currentSequence, setCurrentSequence] = useState([])

  const [activeTab, setActiveTab] = useState('raw')

  const [analyzeData,    setAnalyzeData]    = useState(null)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [analyzeError,   setAnalyzeError]   = useState(null)
  const [batchResult,    setBatchResult]    = useState(null)
  const [batchLoading,   setBatchLoading]   = useState(false)
  const [batchError,     setBatchError]     = useState(null)

  const effectiveSequence = currentSequence.length > MAX_SEQ_LEN
    ? currentSequence.slice(-MAX_SEQ_LEN) : currentSequence

  const handlePredict = useCallback(async (seq) => {
    setCurrentSequence(seq)
    await runPredict(seq)
  }, [runPredict])

  const handleFileSelect = useCallback(async (file) => {
    if (!file) return
    setAnalyzeData(null); setBatchResult(null); setAnalyzeError(null)
    setAnalyzeLoading(true)
    try { setAnalyzeData(await api.analyzeFile(file)) }
    catch (e) { setAnalyzeError(e.message) }
    finally { setAnalyzeLoading(false) }
  }, [])

  const handleBatchPredict = useCallback(async (file) => {
    if (!file) return
    setBatchResult(null); setBatchError(null); setBatchLoading(true)
    try { setBatchResult(await api.predictBatchResults(file)) }
    catch (e) { setBatchError(e.message) }
    finally { setBatchLoading(false) }
  }, [])

  const globalError = error || analyzeError || batchError

  const inputProps = {
    activeTab,
    onTabChange:    setActiveTab,
    onPredict:      handlePredict,
    onFileSelect:   handleFileSelect,
    onBatchPredict: handleBatchPredict,
    loading:        status === 'loading',
    batchLoading,
  }

  return (
    <div className="min-h-screen bg-grid">
      <Header modelActive={modelActive} />

      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">

        {globalError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="font-medium">Lỗi:</span> {globalError}
          </div>
        )}

        {/* ── TAB NHẬP CHUỖI ──────────────────────────────────────────── */}
        {activeTab === 'raw' && (
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 flex flex-col gap-5">
              <InputSection {...inputProps} />
              <ExplainabilityPanel
                sequence={effectiveSequence}
                explainability={result.explainability}
              />
            </div>
            <div className="lg:col-span-7 flex flex-col gap-5">
              <PredictionOutputs prediction={result.prediction} status={status} />
              <SimilarSequences sequences={result.similar_sequences} loading={status === 'loading'} />
            </div>
          </main>
        )}

        {/* ── TAB UPLOAD HÀNG LOẠT ────────────────────────────────────── */}
        {activeTab === 'batch' && (
          <div className="flex flex-col gap-6">

            {/* Hàng 1: Upload | Stats 2×2 | Histogram */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <InputSection {...inputProps} />
              <BatchStats data={analyzeData} loading={analyzeLoading} />
              <BatchCharts.Histogram data={analyzeData} loading={analyzeLoading} />
            </div>

            {/* Hàng 2: Thống kê 6 attr (thu nhỏ) | Token Importance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BatchCharts.AttrOutputStats data={batchResult} loading={batchLoading} />
              <BatchCharts.TokenImportance data={batchResult} loading={batchLoading} />
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
