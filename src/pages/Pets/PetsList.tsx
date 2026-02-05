import { useNavigate } from 'react-router-dom'
import { PetsHeader } from '../../components/layout/PetsHeader'
import { PetsListHero } from './components/list/PetsListHero'
import { SearchBar } from './components/list/SearchBar'
import { Pagination } from '../../components/Pagination'
import { PetsGrid } from './components/list/PetsGrid'
import {
  DevStatusBar,
  EmptyState,
  InlineCount,
} from './components/list/States'
import { FullPageSpinner } from '../../components/ui/PageStates'
import { usePetsList } from './hooks/usePetsList'

export default function PetsList() {
  const navigate = useNavigate()

  const {
    authLoading,
    isAuthenticated,
    pets,
    petsRawCount,
    petsFilteredCount,
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
    speciesFilter,
    setSpeciesFilter,
    breedFilter,
    setBreedFilter,
    ageMinText,
    setAgeMinText,
    ageMaxText,
    setAgeMaxText,
    clearFilters,
    filtersActive,
  } = usePetsList({ pageSize: 10, pollingMs: 10_000 })

  if (authLoading) return <FullPageSpinner label="Carregando..." />
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200">
      <PetsHeader />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        {import.meta.env.DEV && (
          <DevStatusBar
            isAuthenticated={isAuthenticated}
            loading={loading}
            authLoading={authLoading}
            petsCount={pets.length}
            totalElements={totalElements}
          />
        )}

        <PetsListHero
          onAdd={() => navigate('/pets/novo')}
          onViewTutores={() => navigate('/tutores')}
        />

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

        <div className="mb-8 bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-black/5 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Filtros</h2>
              <p className="text-slate-600 text-sm mt-1">Aplicados localmente na página atual.</p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!filtersActive || loading}
              className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Limpar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2" htmlFor="speciesFilter">
                Espécie
              </label>
              <input
                id="speciesFilter"
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                placeholder="Ex.: Gato, Cachorro"
                className="block w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2" htmlFor="breedFilter">
                Raça
              </label>
              <input
                id="breedFilter"
                value={breedFilter}
                onChange={(e) => setBreedFilter(e.target.value)}
                placeholder="Ex.: Poodle, Vira-lata"
                className="block w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2" htmlFor="ageMin">
                Idade mín.
              </label>
              <input
                id="ageMin"
                value={ageMinText}
                onChange={(e) => setAgeMinText(e.target.value)}
                placeholder="0"
                inputMode="numeric"
                className="block w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2" htmlFor="ageMax">
                Idade máx.
              </label>
              <input
                id="ageMax"
                value={ageMaxText}
                onChange={(e) => setAgeMaxText(e.target.value)}
                placeholder="80"
                inputMode="numeric"
                className="block w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <InlineCount total={totalElements} />
          {filtersActive && (
            <span className="text-xs font-semibold text-slate-600 bg-white/70 border border-white rounded-xl px-3 py-2">
              Exibindo {petsFilteredCount} de {petsRawCount} nesta página
            </span>
          )}
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
      </main>
    </div>
  )
}