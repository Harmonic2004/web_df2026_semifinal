import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts'

// ── Shared Tooltip ────────────────────────────────────────────────────────────
const TooltipBox = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="text-slate-500 mb-0.5">{label}</p>
      <p className="font-semibold text-slate-800">{fmt ? fmt(payload[0].value) : payload[0].value}</p>
    </div>
  )
}

function Skeleton({ h = 'h-full' }) {
  return (
    <section className={`bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col ${h} animate-pulse`}>
      <div className="h-4 w-40 bg-slate-100 rounded-full mb-2" />
      <div className="h-3 w-56 bg-slate-100 rounded-full mb-5" />
      <div className="flex-1 bg-slate-50 rounded-lg" />
    </section>
  )
}

// ── Màu chung ─────────────────────────────────────────────────────────────────
const BLUE_SHADES   = ['#3b82f6','#2563eb','#1d4ed8','#1e40af','#1e3a8a']
// Tất cả attr dùng chung dải indigo — đẹp, nhất quán
const INDIGO_MAIN   = '#6366f1'
const INDIGO_SHADES = [
  '#6366f1','#4f46e5','#4338ca','#3730a3','#312e81',
  '#6366f1','#4f46e5','#4338ca','#3730a3','#312e81',
]

// ═════════════════════════════════════════════════════════════════════════════
//  Histogram độ dài chuỗi
// ═════════════════════════════════════════════════════════════════════════════
function Histogram({ data, loading }) {
  if (loading) return <Skeleton />
  if (!data)   return null
  const { histogram = [] } = data

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-800 mb-0.5">Histogram độ dài chuỗi</h2>
        <p className="text-xs text-slate-400">Phân phối số lượng theo từng độ dài</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={histogram} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="length" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<TooltipBox fmt={v => `${v} chuỗi`} />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {histogram.map((_, i) => (
              <Cell key={i} fill={BLUE_SHADES[i % BLUE_SHADES.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  6 mini chart thống kê nhãn dự đoán — thu nhỏ, cùng màu indigo
// ═════════════════════════════════════════════════════════════════════════════
function AttrMiniChart({ attrKey, data }) {
  const label = attrKey.replace('attr_', 'Attr ')
  const empty = !data || data.length === 0

  return (
    <div className={`rounded-lg border p-2.5 flex flex-col gap-1 ${empty ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200/80'}`}>
      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{label}</span>
      {empty ? (
        <div className="flex items-center justify-center h-14 text-[10px] text-slate-300">Chưa có dữ liệu</div>
      ) : (
        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={data} margin={{ top: 2, right: 2, left: -34, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 8, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-white/95 border border-slate-200 rounded-lg shadow px-2 py-1.5 text-[10px]">
                    <p className="text-slate-500">Nhãn: <span className="font-mono font-semibold text-slate-700">{label}</span></p>
                    <p className="font-semibold text-indigo-600">{payload[0].value} mẫu</p>
                  </div>
                )
              }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={24}>
              {data.map((_, i) => (
                <Cell key={i} fill={INDIGO_SHADES[i % INDIGO_SHADES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function AttrOutputStats({ data, loading }) {
  if (loading) {
    return (
      <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 h-full">
        <div className="h-3.5 w-48 bg-slate-100 rounded-full mb-1.5 animate-pulse" />
        <div className="h-3 w-64 bg-slate-100 rounded-full mb-4 animate-pulse" />
        {/* grid 3 cột × 2 hàng */}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-50 rounded-lg border border-slate-100 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }
  if (!data?.attr_stats) return null

  const attrs = ['attr_1','attr_2','attr_3','attr_4','attr_5','attr_6']

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 h-full">
      <div className="mb-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-800 mb-0.5">Thống kê nhãn dự đoán</h2>
        <p className="text-xs text-slate-400">Top nhãn được dự đoán nhiều nhất cho từng thuộc tính đầu ra</p>
      </div>
      {/* Giữ nguyên grid 3 cột × 2 hàng, thu nhỏ padding/height */}
      <div className="grid grid-cols-3 gap-2.5">
        {attrs.map(attr => (
          <AttrMiniChart key={attr} attrKey={attr} data={data.attr_stats?.[attr] ?? []} />
        ))}
      </div>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  Token Importance (Batch)
// ═════════════════════════════════════════════════════════════════════════════
function TokenImportance({ data, loading }) {
  if (loading) {
    return (
      <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col h-full animate-pulse">
        <div className="h-3.5 w-48 bg-slate-100 rounded-full mb-1.5" />
        <div className="h-3 w-64 bg-slate-100 rounded-full mb-5" />
        <div className="flex-1 bg-slate-50 rounded-lg" />
      </section>
    )
  }

  const items = data?.token_importance ?? []

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-800 mb-0.5">Token quan trọng nhất</h2>
        <p className="text-xs text-slate-400">Trung bình Attention Weight · Top 15 token xuất hiện nhiều nhất</p>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-400">Chạy dự đoán để xem token quan trọng</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={items}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 1]}
              tickFormatter={v => `${(v * 100).toFixed(0)}%`}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="token"
              width={52}
              tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-white/95 border border-slate-200 rounded-lg shadow px-3 py-2 text-xs">
                    <p className="text-slate-500 mb-0.5">Token: <span className="font-mono font-semibold text-slate-700">{label}</span></p>
                    <p className="font-semibold text-indigo-600">{(payload[0].value * 100).toFixed(1)}%</p>
                  </div>
                )
              }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="importance" radius={[0, 6, 6, 0]} maxBarSize={18}>
              {items.map((_, i) => (
                <Cell key={i} fill={INDIGO_SHADES[i % INDIGO_SHADES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}

const BatchCharts = { Histogram, AttrOutputStats, TokenImportance }
export default BatchCharts
