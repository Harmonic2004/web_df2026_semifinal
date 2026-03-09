function SimilarityBadge({ value }) {
  const color = value >= 95 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : value >= 85 ? 'bg-sky-50 text-sky-700 border-sky-200'
              :               'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`badge border font-mono font-semibold ${color}`}>
      {value}%
    </span>
  )
}

const ATTR_COLS = ['attr_1','attr_2','attr_3','attr_4','attr_5','attr_6']

function OutputCell({ output }) {
  if (!output) return <span className="text-slate-300 text-xs">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {ATTR_COLS.map(col => (
        <span key={col} className="inline-flex items-center gap-0.5 font-mono text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
          <span className="text-indigo-400">{col.replace('attr_', 'A')}:</span>
          {output[col] != null ? output[col] : '—'}
        </span>
      ))}
    </div>
  )
}

export default function SimilarSequences({ sequences = [], loading = false }) {
  const rows = loading
    ? Array.from({ length: 3 }, (_, i) => ({ skeleton: true, id: i }))
    : sequences

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Tiêu đề */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <h3 className="text-sm font-bold text-slate-900">Chuỗi tương tự nhất</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Các mẫu lịch sử khớp với đầu vào hiện tại</p>
        </div>
        <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors bg-white">
          Xem cơ sở dữ liệu →
        </button>
      </div>

      {/* Bảng */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-400 uppercase tracking-widest">
              <th className="py-3 px-4 font-semibold whitespace-nowrap">ID Khách hàng</th>
              <th className="py-3 px-4 font-semibold">Đoạn chuỗi</th>
              <th className="py-3 px-4 font-semibold">Output thực tế</th>
              <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">Tương đồng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-slate-400">
                  Chạy dự đoán để xem các chuỗi tương tự
                </td>
              </tr>
            ) : rows.map((row, i) =>
              row.skeleton ? (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-3.5 w-24 bg-slate-100 rounded-full" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 w-40 bg-slate-100 rounded-full" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 w-52 bg-slate-100 rounded-full" /></td>
                  <td className="py-4 px-4 flex justify-end"><div className="h-6 w-14 bg-slate-100 rounded-full" /></td>
                </tr>
              ) : (
                <tr key={row.customer_id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600 whitespace-nowrap group-hover:text-brand-600 transition-colors">
                    {row.customer_id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-xs text-slate-500 max-w-[200px] truncate">
                      {row.sequence_snippet.join(' ')}…
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <OutputCell output={row.output} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <SimilarityBadge value={row.similarity} />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
