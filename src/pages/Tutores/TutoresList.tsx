import { Link } from 'react-router-dom'
import { PetsHeader } from '../Pets/components/shared/PetsHeader'
import { FullPageAuthError, FullPageSpinner } from '../Pets/components/shared/PageStates'
import { useTutoresList } from './hooks/useTutoresList'
import { TutorCard } from './components/TutorCard'
import { Pagination } from './components/Pagination'

export default function TutoresList() {
  const {
    authLoading,
    isAuthenticated,
    tutores,
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
  } = useTutoresList({ pageSize: 10, pollingMs: 10_000 })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200">
      <PetsHeader />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Tutores</h1>
            <p className="text-slate-600 mt-1">Listagem paginada (GET /v1/tutores?page&size)</p>
          </div>
          <Link
            to="/tutores/novo"
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition w-full sm:w-auto"
          >
            + Cadastrar Tutor
          </Link>
        </div>

        {error && (
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
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
              {refreshing && (
                <span className="text-xs font-semibold text-slate-500 bg-white/70 border border-white rounded-xl px-3 py-2">
                  Atualizando…
                </span>
              )}
            </div>

            <div className="max-w-xl w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por nome (se disponível na API)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && search()}
                    className="block w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  onClick={search}
                  disabled={loading}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={clearSearch}
                  disabled={loading && !searchTerm}
                  className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Limpar
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">Dica: pressione Enter para buscar.</p>
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
      </div>
    </div>
  )
}
