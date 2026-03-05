import { useState, useCallback } from 'react'
import Header from './components/Header'
import InputSection from './components/InputSection'
import PredictionOutputs from './components/PredictionOutputs'
import ExplainabilityPanel from './components/ExplainabilityPanel'
import SimilarSequences from './components/SimilarSequences'
import { usePrediction } from './hooks/usePrediction'

const MAX_SEQ_LEN = 37

export default function App() {
  const { result, status, error, modelActive, runPredict } = usePrediction()
  const [currentSequence, setCurrentSequence] = useState([])
  const [activeTab, setActiveTab] = useState('raw')

  // Truncate khớp với model (giữ phần cuối)
  const effectiveSequence = currentSequence.length > MAX_SEQ_LEN
    ? currentSequence.slice(-MAX_SEQ_LEN)
    : currentSequence

  const handlePredict = useCallback(async (seq) => {
    setCurrentSequence(seq)
    await runPredict(seq)
  }, [runPredict])

  return (
    <div className="min-h-screen bg-grid">
      <Header modelActive={modelActive} />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <InputSection
              onPredict={handlePredict}
              loading={status === 'loading'}
              onTabChange={setActiveTab}
            />
            {activeTab === 'raw' && (
              <ExplainabilityPanel
                sequence={effectiveSequence}
                explainability={result.explainability}
              />
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {activeTab === 'raw' ? (
              <>
                <PredictionOutputs prediction={result.prediction} status={status} />
                <SimilarSequences
                  sequences={result.similar_sequences}
                  loading={status === 'loading'}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white min-h-[300px]">
                <p className="text-sm text-slate-400">Batch output will appear here…</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}
