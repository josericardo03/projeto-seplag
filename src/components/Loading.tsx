import { useEffect, useState } from 'react'
import { clearTokens } from '../services/tokenStorage'

export default function Loading() {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), 6000)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md text-center bg-white/70 backdrop-blur rounded-3xl shadow-2xl border border-black/5 p-8">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4" />
        <p className="text-gray-700 font-semibold text-lg">{slow ? 'Ainda carregando…' : 'Carregando…'}</p>

        <div className="mt-6 space-y-4">
          <p className="text-sm text-slate-600">
            Se travar, use as opções abaixo. Caminho atual:{' '}
            <span className="font-semibold">{window.location.pathname}</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 transition"
            >
              Recarregar
            </button>
            <button
              type="button"
              onClick={() => {
                clearTokens()
                window.location.href = '/login'
              }}
              className="w-full px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition"
            >
              Limpar sessão
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Se persistir: abra o DevTools (F12) → Network e veja se as chamadas para a API estão retornando 401/timeout.
          </p>
        </div>
      </div>
    </div>
  )
}
