function importanceStyle(score) {
  if (score >= 0.75) return 'bg-violet-600 text-white shadow-sm shadow-violet-300'
  if (score >= 0.5)  return 'bg-violet-400/80 text-white'
  if (score >= 0.25) return 'bg-violet-200 text-violet-800'
  return 'text-slate-400'
}

export default function ExplainabilityPanel({ sequence, explainability }) {
  const tokens     = sequence || []
  const importance = explainability?.token_importance || []
  const isLoading  = tokens.length > 0 && importance.length === 0

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Tiêu đề */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
        <h3 className="text-sm font-bold text-slate-900">Giải thích AI</h3>
        <span className="ml-auto text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          Trọng số Attention trung bình · Toàn bộ lớp & đầu
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Mức độ quan trọng của token được tính từ giá trị attention trung bình của token CLS qua tất cả các lớp và đầu.
        Token được tô đậm hơn sẽ nhận được attention cao hơn từ mô hình.
      </p>

      {/* Bản đồ nhiệt token */}
      {tokens.length === 0 ? (
        <div className="rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center h-28">
          <p className="text-sm text-slate-400">Chạy dự đoán để xem mức độ quan trọng</p>
        </div>
      ) : isLoading ? (
        <div className="rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center h-28">
          <svg className="animate-spin w-5 h-5 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-sm leading-[2.8] break-words">
          {tokens.map((token, i) => {
            const score = importance[i] ?? 0
            return (
              <span
                key={i}
                title={`Token: ${token} | Attention: ${(score * 100).toFixed(0)}%`}
                className={`inline-block mx-0.5 my-0.5 px-2 py-0.5 rounded-md cursor-default transition-all ${importanceStyle(score)}`}
              >
                {token}
              </span>
            )
          })}
        </div>
      )}

      {/* Chú giải */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Trọng số Attention</span>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Thấp</span>
          <div className="w-20 h-2 rounded-full bg-gradient-to-r from-slate-200 via-violet-300 to-violet-600" />
          <span>Cao</span>
        </div>
      </div>
    </div>
  )
}
