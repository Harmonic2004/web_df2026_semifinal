import AttributeCard from './AttributeCard'

export default function PredictionOutputs({ prediction, status }) {
  const isLoading = status === 'loading'
  const hasData   = prediction && status === 'success'

  return (
    <section>
      <div className="flex items-center gap-2 mb-4 px-0.5">
        <svg className="w-5 h-5 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        <h2 className="text-base font-bold text-slate-900">Kết quả dự đoán</h2>
        <span className="badge bg-slate-100 text-slate-500 font-mono text-[10px]">UINT16</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <AttributeCard
            key={i}
            index={i}
            value={hasData ? prediction[`attr_${i + 1}`] : null}
            probability={hasData ? prediction.probabilities[i] : null}
            skeleton={isLoading}
          />
        ))}
      </div>
    </section>
  )
}
