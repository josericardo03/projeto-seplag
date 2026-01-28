import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loading from './Loading'
import { clearTokens } from '../services/tokenStorage'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setStuck(false)
      return
    }
    const id = window.setTimeout(() => setStuck(true), 6000)
    return () => window.clearTimeout(id)
  }, [isLoading])

  if (isLoading && !stuck) return <Loading />
  if (isLoading && stuck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-3xl shadow-2xl border border-black/5 p-8 text-center">
          <h1 className="text-xl font-extrabold text-slate-900 mb-2">Carregamento demorando</h1>
          <p className="text-slate-600 mb-6">Clique abaixo para limpar a sessão e voltar ao login.</p>
          <button
            type="button"
            onClick={() => {
              clearTokens()
              window.location.href = '/login'
            }}
            className="w-full px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition"
          >
            Ir para login
          </button>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <>{children}</>
}

