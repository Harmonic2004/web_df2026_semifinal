import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts'

// ── Shared ────────────────────────────────────────────────────────────────────
const TooltipBox = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="text-slate-500 mb-0.5">{label}</p>
      <p className="font-semibold text-slate-800">{fmt ? fmt(payload[0].value) : payload[0].value}</p>
    </div>
  )
}

function Card({ title, sub, children }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col h-full">
      <div className="mb-5">
        <h2 className="text-base font-normal tracking-tight text-slate-800 mb-1">{title}</h2>
        <p className="text-sm text-slate-400">{sub}</p>
      </div>
      {children}
    </section>
  )
}

function Skeleton() {
  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col h-full animate-pulse">
      <div className="h-4 w-48 bg-slate-100 rounded-full mb-2" />
      <div className="h-3 w-64 bg-slate-100 rounded-full mb-6" />
      <div className="flex-1 bg-slate-50 rounded-lg" />
    </section>
  )
}

// ── Màu gradient cho từng bar ─────────────────────────────────────────────────
const BLUE_SHADES   = ['#3b82f6','#2563eb','#1d4ed8','#1e40af','#1e3a8a']
const GREEN_SHADES  = ['#10b981','#059669','#047857','#065f46','#064e3b',
                       '#10b981','#059669','#047857','#065f46','#064e3b']
const PURPLE_SHADES = ['#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95',
                       '#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95',
                       '#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95']

// ── Histogram ─────────────────────────────────────────────────────────────────
function Histogram({ data, loading }) {
  if (loading) return <Skeleton />
  if (!data) return null
  const { histogram = [] } = data

  return (
    <Card title="Histogram độ dài chuỗi" sub="Phân phối số lượng token theo từng độ dài">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={histogram} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="length"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<TooltipBox fmt={v => `${v} sequences`} />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {histogram.map((_, i) => (
              <Cell key={i} fill={BLUE_SHADES[i % BLUE_SHADES.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

// ── Prefix-3 ──────────────────────────────────────────────────────────────────
function Prefix3({ data, loading }) {
  if (loading) return <Skeleton />
  if (!data) return null
  const { top_prefix3 = [] } = data

  return (
    <Card title="Xếp hạng Prefix-3" sub="10 luồng 3 hành vi đầu tiên xuất hiện nhiều nhất">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={top_prefix3}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="prefix"
            width={88}
            tick={{ fontSize: 9, fill: '#64748b' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<TooltipBox fmt={v => `${v} lần`} />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
            {top_prefix3.map((_, i) => (
              <Cell key={i} fill={GREEN_SHADES[i % GREEN_SHADES.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

const BatchCharts = { Histogram, Prefix3 }
export default BatchCharts
