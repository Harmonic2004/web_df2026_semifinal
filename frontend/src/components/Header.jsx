export default function Header({ modelActive = false }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

        {/* Logo + Tiêu đề */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            DF
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Dự đoán hành vi người dùng
            </h1>
            <p className="text-[11px] text-slate-400 leading-tight">
              Đầu ra UINT16 · Phân tích chuỗi hành động tuần tự
            </p>
          </div>
          <span className="hidden sm:inline ml-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-100">
            Dataflow 2026
          </span>
        </div>

        {/* Trạng thái */}
        <div className="flex items-center gap-3">
          <div className={`badge ${
            modelActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              modelActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`} />
            {modelActive ? 'Model đang hoạt động' : 'Chế độ thử nghiệm'}
          </div>

          <button
            title="Tải lại trang"
            onClick={() => window.location.reload()}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>

      </div>
    </header>
  )
}
