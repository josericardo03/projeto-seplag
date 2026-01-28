import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const { isAuthenticated, isLoading, error, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const from = (location.state as any)?.from?.pathname || '/'

  if (!isLoading && isAuthenticated) return <Navigate to={from} replace />

  const onSubmit = async () => {
    setLocalError(null)
    if (!username.trim() || !password) {
      setLocalError('Informe usuário e senha')
      return
    }
    try {
      setSubmitting(true)
      await login(username.trim(), password)
      navigate(from, { replace: true })
    } catch (e: any) {
      setLocalError(e?.response?.data?.message || e?.message || 'Falha ao autenticar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-3xl shadow-2xl border border-black/5 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-extrabold">
            PM
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Entrar</h1>
            <p className="text-slate-600 text-sm">Acesse para gerenciar pets e tutores</p>
          </div>
        </div>

        {(localError || error) && (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-700 font-semibold text-sm">
            {localError || error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800" htmlFor="username">
              Usuário
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Digite seu usuário"
              autoComplete="username"
              disabled={submitting}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="block w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              disabled={submitting}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            />
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="w-full px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

      </div>
    </div>
  )
}

