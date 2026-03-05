import { useState, useRef } from 'react'
import { api } from '../services/api'

const PLACEHOLDER = '3246,102,4037,775.0,103.0,929.0,102.0,4129.0,108.0'

export default function InputSection({ onPredict, loading, onTabChange }) {

  const [tab, setTab] = useState('raw')
  const [rawValue, setRawValue] = useState(PLACEHOLDER)

  const [file, setFile] = useState(null)
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchError, setBatchError] = useState(null)

  const fileRef = useRef(null)

  const parseSequence = (text) =>
    text.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n))

  const handleTabChange = (t) => {
    setTab(t)
    onTabChange?.(t)
  }

  const handleRunRaw = () => {
    const seq = parseSequence(rawValue)
    if (seq.length) onPredict(seq)
  }

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleBatchDownload = async () => {
    if (!file) return

    setBatchLoading(true)
    setBatchError(null)

    try {
      const blob = await api.predictBatch(file)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      a.download = 'predictions.json'
      a.click()

      URL.revokeObjectURL(url)

    } catch (e) {
      setBatchError(e.message)
    } finally {
      setBatchLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden">

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/60">
        {['raw', 'batch'].map(t => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px
              ${tab === t
                ? 'border-brand-600 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t === 'raw' ? 'Raw Sequence' : 'Batch File Upload'}
          </button>
        ))}
      </div>

      <div className="p-5">

        {tab === 'raw' ? (

          <>
            <label className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Input Array
              </span>

              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Integer IDs
              </span>
            </label>

            <div className="relative">

              <textarea
                value={rawValue}
                onChange={e => setRawValue(e.target.value)}
                spellCheck={false}
                className="w-full h-28 border border-slate-200 rounded-xl p-3 text-sm font-mono bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none transition-all leading-relaxed"
                placeholder="Enter action sequence IDs separated by spaces…"
              />

              <button
                onClick={() => setRawValue('')}
                className="absolute bottom-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                title="Clear"
              >
                ✕
              </button>

            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              {parseSequence(rawValue).length} tokens
            </p>

          </>

        ) : (

          <>
            <label className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Batch Upload
              </span>

              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                .csv / .txt
              </span>
            </label>

            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-brand-50/40 hover:border-brand-300 transition-all group"
            >

              {file ? (
                <p className="text-sm font-medium text-slate-700">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-500 group-hover:text-brand-600">
                    Click to browse
                  </p>
                  <p className="text-xs text-slate-400">
                    CSV or TXT, max 5 MB
                  </p>
                </>
              )}

            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileChange}
            />

            {batchError && (
              <p className="mt-1.5 text-xs text-rose-500">
                {batchError}
              </p>
            )}

          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">

          <button className="text-xs font-medium text-slate-400 hover:text-brand-600">
            Export Last Output
          </button>

          {tab === 'raw' ? (

            <button
              onClick={handleRunRaw}
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700"
            >
              {loading ? 'Running…' : 'Run Prediction'}
            </button>

          ) : (

            <button
              onClick={handleBatchDownload}
              disabled={!file || batchLoading}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700"
            >
              {batchLoading ? 'Processing…' : 'Run & Download'}
            </button>

          )}

        </div>

      </div>
    </div>
  )
}