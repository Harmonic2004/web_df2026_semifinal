// Tất cả card dùng chung màu indigo cho Confidence
const ATTR_CONFIG = [
  { bg: 'bg-blue-50',    text: 'text-blue-700',   bar: 'bg-blue-500'    },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  bar: 'bg-indigo-500'  },
  { bg: 'bg-amber-50',   text: 'text-amber-700',   bar: 'bg-amber-500'   },
  { bg: 'bg-rose-50',    text: 'text-rose-700',    bar: 'bg-rose-500'    },
  { bg: 'bg-violet-50',  text: 'text-violet-700',  bar: 'bg-violet-500'  },
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
    <div className="card p-4 flex flex-col hover:shadow-card-hover transition-shadow">
      {/* Nhãn */}
      <div className="flex items-center justify-between mb-2">
        <span className={`badge ${cfg.bg} ${cfg.text} border border-current/10 font-semibold`}>
          Attr_{index + 1}
        </span>
        <svg className="text-slate-300 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      {/* Giá trị */}
      <div className="font-mono font-bold text-2xl text-slate-900 tabular-nums">
        {value != null ? value.toLocaleString() : '—'}
      </div>
      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">UINT16</div>

      {/* Thanh Confidence — dùng chung màu indigo */}
      <div className="mt-auto pt-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Độ tin cậy</span>
          <span className="font-semibold text-indigo-600">
            {pct != null ? `${pct}%` : '—'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-700"
            style={{ width: pct != null ? `${pct}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  )
}
