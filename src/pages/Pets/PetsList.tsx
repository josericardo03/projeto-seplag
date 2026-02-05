import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PetsHeader } from '../../components/layout/PetsHeader'
import { Footer } from '../../components/layout/Footer'
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
  const [showFilters, setShowFilters] = useState(false)

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

  const inputFocus =
    'outline-none transition focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white'

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <PetsHeader />

      <main id="main-content" className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 w-full">
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
          <div className="mb-6 flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl bg-red-50/90 border border-red-200 text-red-800 text-sm font-medium">
            <span>Falha ao carregar:</span>
            <span className="font-semibold">{error}</span>
            <button type="button" onClick={reload} className="text-red-600 underline hover:no-underline font-semibold">
              Tentar novamente
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full mb-6 items-stretch sm:items-center">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={search}
            onClear={clearSearch}
            disabled={loading}
            className="flex-1 min-w-0"
            showHint={false}
          />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="px-5 py-3.5 rounded-xl bg-white border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-colors shrink-0 inline-flex items-center justify-center gap-2"
            aria-expanded={showFilters}
            aria-controls="filtros-panel"
            id="filtros-btn"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
          </button>
        </div>

        {showFilters && (
        <section id="filtros-panel" className="mb-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm p-5 sm:p-6" aria-label="Filtros" aria-labelledby="filtros-btn">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-sm font-semibold text-stone-800 uppercase tracking-wide">Filtros</h2>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!filtersActive || loading}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Limpar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1.5" htmlFor="speciesFilter">
                Espécie
              </label>
              <input
                id="speciesFilter"
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                placeholder="Ex.: Gato, Cachorro"
                className={`block w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 ${inputFocus}`}
                disabled={loading}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1.5" htmlFor="breedFilter">
                Raça
              </label>
              <input
                id="breedFilter"
                value={breedFilter}
                onChange={(e) => setBreedFilter(e.target.value)}
                placeholder="Ex.: Poodle, Vira-lata"
                className={`block w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 ${inputFocus}`}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5" htmlFor="ageMin">
                Idade mín.
              </label>
              <input
                id="ageMin"
                value={ageMinText}
                onChange={(e) => setAgeMinText(e.target.value)}
                placeholder="0"
                inputMode="numeric"
                className={`block w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 ${inputFocus}`}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5" htmlFor="ageMax">
                Idade máx.
              </label>
              <input
                id="ageMax"
                value={ageMaxText}
                onChange={(e) => setAgeMaxText(e.target.value)}
                placeholder="80"
                inputMode="numeric"
                className={`block w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 ${inputFocus}`}
                disabled={loading}
              />
            </div>
          </div>
        </section>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <InlineCount total={totalElements} />
          {filtersActive && (
            <span className="text-xs font-medium text-stone-600 bg-white/80 border border-stone-200 rounded-lg px-2.5 py-1.5">
              {petsFilteredCount} de {petsRawCount} nesta página
            </span>
          )}
          {refreshing && (
            <span className="text-xs font-medium text-stone-500 bg-white/80 border border-stone-200 rounded-lg px-2.5 py-1.5">
              Atualizando…
            </span>
          )}
        </div>

        {loading && pets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-stone-200 border-t-teal-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-stone-500">Carregando pets...</p>
          </div>
        ) : pets.length === 0 ? (
          <EmptyState message={emptyMessage} onClear={searchTerm.trim() ? clearSearch : undefined} />
        ) : (
          <PetsGrid pets={pets} />
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPage={goToPage} />
      </main>

      <Footer />
    </div>
  )
}