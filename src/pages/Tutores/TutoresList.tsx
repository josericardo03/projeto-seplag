import { Link } from 'react-router-dom'
import { PetsHeader } from '../../components/layout/PetsHeader'
import { FullPageSpinner } from '../../components/ui/PageStates'
import { useTutoresList } from './hooks/useTutoresList'
import { TutorCard } from './components/TutorCard'
import { Pagination } from '../../components/Pagination'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/Inputs'

export default function TutoresList() {
  const {
    authLoading,
    isAuthenticated,
    tutores,
    tutoresRawCount,
    tutoresFilteredCount,
    loading,
    refreshing,
    error,
    searchTerm,
    setSearchTerm,
    totalElements,
    currentPage,
    totalPages,
    search,
    clearSearch,
    goToPage,
    reload,
    emptyMessage,
    hasEmail,
    setHasEmail,
    hasPhone,
    setHasPhone,
    hasCpf,
    setHasCpf,
    hasPhoto,
    setHasPhoto,
    clearFilters,
    filtersActive,
  } = useTutoresList({ pageSize: 10, pollingMs: 10_000 })

  if (authLoading) return <FullPageSpinner label="Carregando..." />
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200">
      <PetsHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Tutores</h1>
            <p className="text-slate-600 mt-1">Listagem paginada (GET /v1/tutores?page&size)</p>
          </div>
          <Link to="/tutores/novo" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">
              + Cadastrar Tutor
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold" role="alert">
            <span>Falha ao carregar:</span>
            <span className="font-bold">{error}</span>
            <button type="button" onClick={reload} className="ml-2 underline hover:no-underline">
              Tentar novamente
            </button>
          </div>
        )}

        <div className="mb-6 bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-black/5 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-indigo-600 font-extrabold text-lg">{totalElements}</span>
                <span className="text-slate-600 text-sm font-medium">tutores</span>
              </div>
              {filtersActive && (
                <span className="text-xs font-semibold text-slate-600 bg-white/70 border border-white rounded-xl px-3 py-2">
                  Exibindo {tutoresFilteredCount} de {tutoresRawCount} nesta página
                </span>
              )}
              {refreshing && (
                <span className="text-xs font-semibold text-slate-500 bg-white/70 border border-white rounded-xl px-3 py-2">
                  Atualizando…
                </span>
              )}
            </div>

            <div className="max-w-xl w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <TextInput
                    type="text"
                    placeholder="Buscar por nome (se disponível na API)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && search()}
                    disabled={loading}
                  />
                </div>
                <Button onClick={search} disabled={loading} variant="primary" className="px-5 py-3">
                  Buscar
                </Button>
                <Button onClick={clearSearch} disabled={loading && !searchTerm} variant="secondary" className="px-5 py-3">
                  Limpar
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-500">Dica: pressione Enter para buscar.</p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200/60 pt-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Filtros</h2>
                <p className="text-slate-600 text-sm mt-1">Aplicados localmente na página atual.</p>
              </div>
              <Button onClick={clearFilters} disabled={!filtersActive || loading} variant="secondary" size="sm">
                Limpar filtros
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 select-none bg-white/70 border border-slate-200 rounded-2xl px-4 py-3">
                <input
                  type="checkbox"
                  checked={hasEmail}
                  onChange={(e) => setHasEmail(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 accent-indigo-600"
                />
                Com email
              </label>

              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 select-none bg-white/70 border border-slate-200 rounded-2xl px-4 py-3">
                <input
                  type="checkbox"
                  checked={hasPhone}
                  onChange={(e) => setHasPhone(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 accent-indigo-600"
                />
                Com telefone
              </label>

              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 select-none bg-white/70 border border-slate-200 rounded-2xl px-4 py-3">
                <input
                  type="checkbox"
                  checked={hasCpf}
                  onChange={(e) => setHasCpf(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 accent-indigo-600"
                />
                Com CPF
              </label>

              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 select-none bg-white/70 border border-slate-200 rounded-2xl px-4 py-3">
                <input
                  type="checkbox"
                  checked={hasPhoto}
                  onChange={(e) => setHasPhoto(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 accent-indigo-600"
                />
                Com foto
              </label>
            </div>
          </div>
        </div>

        {loading && tutores.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-14 h-14 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Carregando tutores...</p>
            </div>
          </div>
        ) : tutores.length === 0 ? (
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-black/5 p-8 sm:p-12 text-center">
            <p className="text-slate-800 text-lg sm:text-xl font-semibold mb-2">Nenhum tutor encontrado</p>
            <p className="text-slate-600 mb-5">{emptyMessage}</p>
            {searchTerm.trim() && (
              <button type="button" onClick={clearSearch} className="text-orange-600 hover:text-orange-700 font-semibold">
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tutores.map((t) => (
              <TutorCard key={t.id} tutor={t} />
            ))}
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPage={goToPage} />
      </main>
    </div>
  )
}
