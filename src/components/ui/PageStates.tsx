import type { ReactNode } from 'react'

export function FullPageSpinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-700 font-medium">{label}</p>
      </div>
    </div>
  )
}

export function FullPageAuthError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-red-600 font-semibold text-lg mb-2">Erro na autenticação</p>
        <p className="text-slate-600 mb-6">Não foi possível autenticar. Tente novamente.</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}

export function RenderError({ message, actions }: { message: string; actions?: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <p className="text-red-600 font-semibold text-lg mb-2">Erro</p>
        <p className="text-slate-600 mb-6">{message}</p>
        {actions || (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
          >
            Recarregar página
          </button>
        )}
      </div>
    </div>
  )
}

