import { useRef, useState } from 'react'
import { api } from '../services/api'

const PLACEHOLDER = '3246,102,4037,775.0,103.0,929.0,102.0,4129.0,108.0'

export default function InputSection({
  activeTab, onTabChange,
  onPredict, onFileSelect, onBatchPredict,
  loading, batchLoading,
}) {
  const [rawValue,  setRawValue]  = useState(PLACEHOLDER)
  const [file,      setFile]      = useState(null)
  const [dlLoading, setDlLoading] = useState(false)
  const fileRef = useRef(null)

  const parseSequence = (text) =>
    text.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n))

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    onFileSelect?.(f)
  }

  const handleDownload = async () => {
    if (!file) return
    setDlLoading(true)
    try {
      const blob = await api.predictBatch(file)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'predictions.json'; a.click()
      URL.revokeObjectURL(url)
    } finally { setDlLoading(false) }
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full">

      {/* Tabs — controlled từ App */}
      <div className="flex border-b border-slate-100 px-6 pt-4 bg-slate-50/50">
        {[
          { key: 'raw',   label: 'Raw Sequence' },
          { key: 'batch', label: 'Batch File Upload' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`pb-3 text-sm font-normal border-b-2 transition-colors mr-6
              ${activeTab === key
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-500 border-transparent hover:text-slate-800'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-6 flex flex-col gap-4 flex-1 justify-center">

        {activeTab === 'raw' ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs font-normal uppercase tracking-wider text-slate-400">Input Array</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Integer IDs</span>
            </div>
            <div className="relative">
              <textarea
                value={rawValue}
                onChange={e => setRawValue(e.target.value)}
                spellCheck={false}
                className="w-full h-28 border border-slate-200/80 rounded-lg p-3 text-sm font-mono bg-slate-50/30 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none transition-all leading-relaxed"
                placeholder="Enter action sequence IDs…"
              />
              <button
                onClick={() => setRawValue('')}
                className="absolute bottom-3 right-3 w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors text-xs"
              >✕</button>
            </div>
            <p className="text-xs text-slate-400">{parseSequence(rawValue).length} tokens</p>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs font-normal uppercase tracking-wider text-slate-400">Batch Upload</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">.csv</span>
            </div>
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-slate-300/80 bg-slate-50/30 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group"
            >
              {file ? (
                <>
                  <span className="text-sm font-normal text-indigo-600 group-hover:text-indigo-700">{file.name}</span>
                  <span className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB · Click để đổi file</span>
                </>
              ) : (
                <>
                  <iconify-icon icon="solar:upload-linear" class="text-2xl text-slate-300 group-hover:text-indigo-400 mb-2 transition-colors" />
                  <span className="text-sm text-slate-500 group-hover:text-indigo-600 transition-colors">Click to browse</span>
                  <span className="text-xs text-slate-400 mt-0.5">CSV, max 10 MB</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {activeTab === 'batch' ? (
            <button
              onClick={handleDownload}
              disabled={!file || dlLoading}
              className="px-3 py-2 rounded-lg text-sm border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-1.5 bg-white shadow-sm disabled:opacity-40"
            >
              <iconify-icon icon="solar:download-linear" class="text-slate-400 text-base" />
              {dlLoading ? 'Đang tải…' : 'Download JSON'}
            </button>
          ) : (
            <span className="text-xs text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
              Export Last Output
            </span>
          )}

          {activeTab === 'raw' ? (
            <button
              onClick={() => onPredict?.(parseSequence(rawValue))}
              disabled={loading}
              className="px-5 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Running…' : 'Run Prediction'}
            </button>
          ) : (
            <button
              onClick={() => onBatchPredict?.(file)}
              disabled={!file || batchLoading}
              className="px-5 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {batchLoading ? 'Processing…' : 'Run Prediction'}
            </button>
          )}
        </div>

      </div>
    </section>
  )
}
