import { Link } from 'react-router-dom'
import { useAuth } from '../../../../hooks/useAuth'

export function PetsHeader() {
  const { isAuthenticated, logout } = useAuth()
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-700 shadow border-b border-white/10 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform no-underline">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center shadow">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow m-0">PetManager</h1>
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/lobby"
                className="px-6 py-2 rounded-xl bg-white/20 text-white font-semibold border border-white/30 hover:bg-white/30 transition"
              >
                Lobby
              </Link>
              <button
                type="button"
                onClick={logout}
                className="px-6 py-2 rounded-xl bg-white/20 text-white font-semibold border border-white/30 hover:bg-white/30 transition"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 rounded-xl bg-white/20 text-white font-semibold border border-white/30 hover:bg-white/30 transition"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

