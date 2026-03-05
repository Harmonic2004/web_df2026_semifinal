import { useState, useCallback, useEffect } from 'react'
import { api } from '../services/api'

const INITIAL = {
  prediction:        null,
  explainability:    null,
  similar_sequences: [],
}

export function usePrediction() {
  const [result, setResult]           = useState(INITIAL)
  const [status, setStatus]           = useState('idle')
  const [error, setError]             = useState(null)
  const [modelActive, setModelActive] = useState(false)

  // Health check khi mount
  useEffect(() => {
    fetch('/health')
      .then(r => r.json())
      .then(d => setModelActive(d?.status === 'ok' && d?.model_loaded === true))
      .catch(() => setModelActive(false))
  }, [])

  const runPredict = useCallback(async (sequence) => {
    if (!sequence.length) return
    setStatus('loading')
    setError(null)
    try {
      const data = await api.predict(sequence)
      setResult(data)
      setStatus('success')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setResult(INITIAL)
    setStatus('idle')
    setError(null)
  }, [])

  return { result, status, error, modelActive, runPredict, reset }
}
