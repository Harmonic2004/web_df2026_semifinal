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

export default function SimilarSequences({ sequences = [], loading = false }) {
  const rows = loading
    ? Array.from({ length: 3 }, (_, i) => ({ skeleton: true, id: i }))
    : sequences

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <h3 className="text-sm font-bold text-slate-900">Top Similar Sequences</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Historical patterns matching current input</p>
        </div>
        <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors bg-white">
          View Database →
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-400 uppercase tracking-widest">
              <th className="py-3 px-5 font-semibold whitespace-nowrap">Customer ID</th>
              <th className="py-3 px-5 font-semibold w-full">Sequence Snippet</th>
              <th className="py-3 px-5 font-semibold text-right whitespace-nowrap">Similarity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-10 text-center text-sm text-slate-400">
                  Run a prediction to see similar sequences
                </td>
              </tr>
            ) : rows.map((row, i) =>
              row.skeleton ? (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-5"><div className="h-3.5 w-24 bg-slate-100 rounded-full" /></td>
                  <td className="py-4 px-5"><div className="h-3.5 w-48 bg-slate-100 rounded-full" /></td>
                  <td className="py-4 px-5 flex justify-end"><div className="h-6 w-14 bg-slate-100 rounded-full" /></td>
                </tr>
              ) : (
                <tr key={row.customer_id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-600 whitespace-nowrap group-hover:text-brand-600 transition-colors">
                    {row.customer_id}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-mono text-xs text-slate-500 max-w-[280px] truncate">
                      {row.sequence_snippet.join(' ')}…
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-right">
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
