import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'

const PURPLE_SHADES = [
  '#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95',
  '#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95',
  '#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95',
]

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="text-slate-500 mb-0.5">Token: <span className="font-mono font-semibold text-slate-700">{label}</span></p>
      <p className="font-semibold text-violet-600">{(payload[0].value * 100).toFixed(1)}%</p>
    </div>
  )
}

export default function BatchPredictionResults({ data, loading }) {
  if (loading) {
    return (
      <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col h-full animate-pulse">
        <div className="flex justify-between items-start mb-6">
          <div className="h-4 w-36 bg-slate-100 rounded-full" />
          <div className="h-6 w-28 bg-slate-100 rounded-full" />
        </div>
        <div className="h-3 w-48 bg-slate-100 rounded-full mb-5" />
        <div className="flex-1 bg-slate-50 rounded-lg" />
      </section>
    )
  }

  if (!data) return null

  const { success = 0, error_count = 0, token_importance = [] } = data

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col h-full">

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2">
          <iconify-icon icon="solar:chart-2-linear" class="text-lg text-indigo-500" />
          <h2 className="text-base font-normal tracking-tight text-slate-800">Kết quả dự báo</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/50 text-emerald-600 flex items-center gap-1.5 text-xs">
            <iconify-icon icon="solar:check-circle-linear" class="text-sm" />
            {success} thành công
          </span>
          {error_count > 0 && (
            <span className="px-2.5 py-1.5 rounded-full border border-rose-200/60 bg-rose-50/50 text-rose-600 flex items-center gap-1.5 text-xs">
              <iconify-icon icon="solar:close-circle-linear" class="text-sm" />
              {error_count} lỗi
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] font-normal uppercase tracking-wider text-slate-400 mb-4">
        Token quan trọng nhất (CLS Attention)
      </p>

      {token_importance.length > 0 ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={token_importance}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 1]}
              tickFormatter={v => `${(v * 100).toFixed(0)}%`}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="token"
              width={52}
              tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<TooltipBox />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="importance" radius={[0, 6, 6, 0]} maxBarSize={18}>
              {token_importance.map((_, i) => (
                <Cell key={i} fill={PURPLE_SHADES[i % PURPLE_SHADES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex-1 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-400">Nhấn Run Prediction để xem kết quả</p>
        </div>
      )}

    </section>
  )
}
