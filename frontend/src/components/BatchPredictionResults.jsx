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

  const { success = 0, error_count = 0, total = 0 } = data
  const successRate = total > 0 ? Math.round(success / total * 100) : 0

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col h-full">

      {/* Tiêu đề */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2">
          <iconify-icon icon="solar:chart-2-linear" class="text-lg text-indigo-500" />
          <h2 className="text-base font-normal tracking-tight text-slate-800">Kết quả dự báo hàng loạt</h2>
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

      {/* Tổng kết */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-slate-800 tabular-nums">{total.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Tổng chuỗi</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">{success.toLocaleString()}</div>
          <div className="text-xs text-emerald-500 mt-1">Thành công</div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-700 tabular-nums">{successRate}%</div>
          <div className="text-xs text-indigo-400 mt-1">Tỉ lệ thành công</div>
        </div>
      </div>

      {/* Thanh tiến trình */}
      <div className="mt-auto">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Tiến độ dự đoán</span>
          <span className="font-semibold text-indigo-600">{successRate}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${successRate}%` }}
          />
        </div>
        {error_count > 0 && (
          <p className="text-xs text-rose-500 mt-2">
            {error_count} chuỗi gặp lỗi trong quá trình dự đoán
          </p>
        )}
      </div>

    </section>
  )
}
