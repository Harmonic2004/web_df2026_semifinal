const BASE_URL = import.meta.env.VITE_API_URL || ''
const BASE = `${BASE_URL}/api/v1`

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // POST /predict → { prediction, explainability, similar_sequences }
  async predict(sequence) {
    const res = await fetch(`${BASE}/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ sequence }),
    })
    return handleResponse(res)
  },

  // POST /predict/batch → blob CSV download
  async predictBatch(file) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE}/predict/batch`, {
      method: 'POST',
      body:   form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || `HTTP ${res.status}`)
    }
    return res.blob()
  },

  // POST /analyze → thống kê file
  async analyzeFile(file) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE}/analyze`, { method: 'POST', body: form })
    return handleResponse(res)
  },

  // POST /predict/batch/results → kết quả + attr_stats
  async predictBatchResults(file) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE}/predict/batch/results`, { method: 'POST', body: form })
    return handleResponse(res)
  },
}
