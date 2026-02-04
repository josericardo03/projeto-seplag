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
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] no-underline">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center shadow">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div className="leading-tight">
              <h1 className="text-2xl font-extrabold text-white drop-shadow m-0">PetManager</h1>
              <p className="text-xs text-white/75 font-semibold">Gestão de Pets e Tutores</p>
            </div>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 flex-wrap">
              <nav className="flex items-center gap-1 p-1 rounded-2xl bg-white/10 border border-white/15">
                <Link to="/lobby" className={navItem(pathname.startsWith('/lobby'))}>
                  Lobby
                </Link>
                <NavLink to="/" className={() => navItem(isPetsActive)} aria-current={isPetsActive ? 'page' : undefined}>
                  Pets
                </NavLink>
                <NavLink to="/tutores" className={({ isActive }) => navItem(isActive)}>
                  Tutores
                </NavLink>
              </nav>

              <button
                type="button"
                onClick={logout}
                className={[navItemBase, 'bg-white/10 border border-white/20 text-white hover:bg-white/15'].join(' ')}
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

