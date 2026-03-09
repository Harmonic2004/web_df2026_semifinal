const STATS = [
  {
    key:   'total',
    label: 'Tổng số chuỗi',
    icon:  'solar:chart-square-linear',
    bg:    'bg-indigo-50',
    color: 'text-indigo-600',
    fmt:   v => v?.toLocaleString() ?? '—',
  },
  {
    key:   'count_short_seq',
    label: 'Chuỗi độ dài ≤ 5',
    icon:  'solar:sort-vertical-linear',
    bg:    'bg-emerald-50',
    color: 'text-emerald-600',
    fmt:   v => v?.toLocaleString() ?? '—',
  },
  {
    key:   'top_prefix2',
    label: 'Prefix-2 phổ biến',
    icon:  'solar:arrow-right-linear',
    bg:    'bg-amber-50',
    color: 'text-amber-600',
    fmt:   v => v ?? '—',
    small: true,
  },
  {
    key:   'complexity_ratio',
    label: 'Tỉ lệ đơn phức tạp',
    icon:  'solar:restart-linear',
    bg:    'bg-rose-50',
    color: 'text-rose-600',
    fmt:   v => v != null ? `${v}%` : '—',
  },
]

function SkeletonStat() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-center gap-2 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-slate-100" />
        <div className="h-2.5 w-24 bg-slate-100 rounded-full" />
      </div>
      <div className="h-7 w-16 bg-slate-100 rounded-md mt-1" />
    </div>
  )
}

export default function BatchStats({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
      {STATS.map(({ key, label, icon, bg, color, fmt, small }) => (
        <div key={key} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
              <iconify-icon icon={icon} class="text-sm" />
            </div>
            <span className="text-xs font-normal uppercase tracking-wider text-slate-400 leading-tight">{label}</span>
          </div>
          <div className={`font-medium tracking-tight text-slate-800 ${small ? 'text-xl' : 'text-2xl'}`}>
            {data ? fmt(data[key]) : '—'}
          </div>
        </div>
      ))}
    </div>
  )
}
