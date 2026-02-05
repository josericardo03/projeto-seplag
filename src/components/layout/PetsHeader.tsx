import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function PetsHeader() {
  const { isAuthenticated, logout } = useAuth()
  const { pathname } = useLocation()

  const isPetsActive = pathname === '/' || pathname.startsWith('/pets')

  const navItemBase =
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition select-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700'

  const navItem = (active: boolean) =>
    [
      navItemBase,
      active ? 'bg-white text-indigo-700 shadow-sm' : 'text-white/90 hover:text-white hover:bg-white/15',
    ].join(' ')

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-700 shadow-lg border-b border-white/10 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] no-underline" aria-label="PetManager - Ir para página inicial">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center shadow">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                {/* Patinha (paw) */}
                <circle cx="7.5" cy="9" r="1.6" />
                <circle cx="10.2" cy="6.6" r="1.6" />
                <circle cx="13.8" cy="6.6" r="1.6" />
                <circle cx="16.5" cy="9" r="1.6" />
                <path d="M12 11c-2.7 0-4.9 1.9-4.9 4.2 0 1.6 1.3 2.9 2.9 2.9.8 0 1.5-.2 2-.6.5.4 1.2.6 2 .6 1.6 0 2.9-1.3 2.9-2.9C16.9 12.9 14.7 11 12 11z" />
              </svg>
            </div>
            <div className="leading-tight">
              <h1 className="text-2xl font-extrabold text-white drop-shadow m-0">PetManager</h1>
              <p className="text-xs text-white/75 font-semibold">Gestão de Pets e Tutores</p>
            </div>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 flex-wrap">
              <nav className="flex items-center gap-1 p-1 rounded-2xl bg-white/10 border border-white/15" aria-label="Navegação principal">
                <NavLink to="/" className={() => navItem(isPetsActive)} aria-current={isPetsActive ? 'page' : undefined}>
                  Pets
                </NavLink>
                <NavLink to="/tutores" className={({ isActive }) => navItem(isActive)}>
                  Tutores
                </NavLink>
                <Link to="/lobby" className={navItem(pathname.startsWith('/lobby'))}>
                  Lobby
                </Link>
              </nav>

              <button
                type="button"
                onClick={logout}
                className={[navItemBase, 'bg-white/10 border border-white/20 text-white hover:bg-white/15'].join(' ')}
                aria-label="Sair da conta"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={[navItemBase, 'bg-white/15 border border-white/25 text-white hover:bg-white/25'].join(' ')}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

