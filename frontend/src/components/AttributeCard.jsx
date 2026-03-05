const ATTR_CONFIG = [
  { color: 'blue',    bg: 'bg-blue-50',    bar: 'bg-blue-500',    text: 'text-blue-700',   ring: 'ring-blue-200'   },
  { color: 'emerald', bg: 'bg-emerald-50', bar: 'bg-emerald-500', text: 'text-emerald-700',ring: 'ring-emerald-200'},
  { color: 'indigo',  bg: 'bg-indigo-50',  bar: 'bg-indigo-500',  text: 'text-indigo-700', ring: 'ring-indigo-200' },
  { color: 'amber',   bg: 'bg-amber-50',   bar: 'bg-amber-500',   text: 'text-amber-700',  ring: 'ring-amber-200'  },
  { color: 'rose',    bg: 'bg-rose-50',    bar: 'bg-rose-500',    text: 'text-rose-700',   ring: 'ring-rose-200'   },
  { color: 'violet',  bg: 'bg-violet-50',  bar: 'bg-violet-500',  text: 'text-violet-700', ring: 'ring-violet-200' },
]

export default function AttributeCard({ index, value, probability, skeleton = false }) {
  const cfg = ATTR_CONFIG[index]
  const pct = probability != null ? Math.round(probability * 100) : null

  if (skeleton) {
    return (
      <div className="card p-4 flex flex-col gap-3 animate-pulse">
        <div className="h-3 w-14 bg-slate-100 rounded-full" />
        <div className="h-7 w-24 bg-slate-100 rounded-lg" />
        <div className="mt-auto space-y-1.5">
          <div className="flex justify-between">
            <div className="h-2.5 w-16 bg-slate-100 rounded-full" />
            <div className="h-2.5 w-10 bg-slate-100 rounded-full" />
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className={`card p-4 flex flex-col hover:shadow-card-hover transition-shadow`}>
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <span className={`badge ${cfg.bg} ${cfg.text} border border-current/10 font-semibold`}>
          Attr_{index + 1}
        </span>
        <svg className="text-slate-300 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      {/* Value */}
      <div className="font-mono font-bold text-2xl text-slate-900 tabular-nums">
        {value != null ? value.toLocaleString() : '—'}
      </div>
      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">UINT16</div>

      {/* Probability bar */}
      <div className="mt-auto pt-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Confidence</span>
          <span className={`font-semibold ${cfg.text}`}>
            {pct != null ? `${pct}%` : '—'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`${cfg.bar} h-full rounded-full transition-all duration-700`}
            style={{ width: pct != null ? `${pct}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  )
}
