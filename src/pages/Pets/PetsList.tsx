import { useNavigate } from 'react-router-dom'
import { PetsHeader } from './components/shared/PetsHeader'
import { PetsListHero } from './components/list/PetsListHero'
import { SearchBar } from './components/list/SearchBar'
import { Pagination } from './components/list/Pagination'
import { PetsGrid } from './components/list/PetsGrid'
import {
  DevStatusBar,
  EmptyState,
  InlineCount,
} from './components/list/States'
import { FullPageAuthError, FullPageSpinner, RenderError } from './components/shared/PageStates'
import { usePetsList } from './hooks/usePetsList'

export default function PetsList() {
  const navigate = useNavigate()

  const {
    authLoading,
    isAuthenticated,
    pets,
    loading,
    refreshing,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalElements,
    search,
    clearSearch,
    goToPage,
    emptyMessage,
    reload,
  } = usePetsList({ pageSize: 10, pollingMs: 10_000 })

  if (authLoading) return <FullPageSpinner label="Carregando autenticação..." />

  if (!isAuthenticated) {
    return (
      <FullPageAuthError
        onRetry={() => {
          localStorage.clear()
          window.location.reload()
        }}
      />
    )
  }

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200">
        <PetsHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
          {import.meta.env.DEV && (
            <DevStatusBar
              isAuthenticated={isAuthenticated}
              loading={loading}
              authLoading={authLoading}
              petsCount={pets.length}
              totalElements={totalElements}
            />
          )}

          <PetsListHero onAdd={() => navigate('/pets/novo')} />

          {error && (
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
              <span>Falha ao carregar:</span>
              <span className="font-bold">{error}</span>
              <button type="button" onClick={reload} className="ml-2 underline hover:no-underline">
                Tentar novamente
              </button>
            </div>
          )}

          <div className="mb-8">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={search}
              onClear={clearSearch}
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-3">
            <InlineCount total={totalElements} />
            {refreshing && (
              <span className="text-xs font-semibold text-slate-500 bg-white/70 border border-white rounded-xl px-3 py-2">
                Atualizando…
              </span>
            )}
          </div>

          {loading && pets.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-14 h-14 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Carregando pets...</p>
              </div>
            </div>
          ) : pets.length === 0 ? (
            <EmptyState message={emptyMessage} onClear={searchTerm.trim() ? clearSearch : undefined} />
          ) : (
            <PetsGrid pets={pets} />
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPage={goToPage} />

          <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate('/tutores')}
              className="px-6 py-3 rounded-2xl bg-white/80 border border-slate-200 text-slate-800 font-semibold shadow-sm hover:bg-white transition"
            >
              Ver Tutores
            </button>
          </div>
        </main>
      </div>
    )
  } catch (e: any) {
    return <RenderError message={e?.message || 'Erro desconhecido'} />
  }
}