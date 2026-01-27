 

export function InlineCount({ total }: { total: number }) {
  return (
    <div className="mb-7 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur border border-white shadow-sm">
      <span className="text-indigo-600 font-extrabold text-lg">{total}</span>
      <span className="text-slate-600 text-sm font-medium">pets encontrados</span>
    </div>
  )
}

export function EmptyState({ message, onClear }: { message: string; onClear?: () => void }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-black/5 p-8 sm:p-12 text-center">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-slate-800 text-lg sm:text-xl font-semibold mb-2">Nenhum pet encontrado</p>
      <p className="text-slate-600 mb-5">{message}</p>
      {onClear && (
        <button type="button" onClick={onClear} className="text-orange-600 hover:text-orange-700 font-semibold">
          Limpar busca
        </button>
      )}
    </div>
  )
}

export function DevStatusBar(props: {
  isAuthenticated: boolean
  loading: boolean
  authLoading: boolean
  petsCount: number
  totalElements: number
}) {
  const { isAuthenticated, loading, authLoading, petsCount, totalElements } = props
  return (
    <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-slate-700 font-semibold text-sm">Auth</span>
          <span className={`text-sm font-bold ${isAuthenticated ? 'text-emerald-600' : 'text-red-600'}`}>
            {isAuthenticated ? '✓' : '✗'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-slate-700 font-semibold text-sm">Loading</span>
          <span className={`text-sm font-bold ${loading ? 'text-amber-600' : 'text-emerald-600'}`}>
            {loading ? '⏳' : '✓'}
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-100/70">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-indigo-700 font-bold text-sm">{petsCount}</span>
          <span className="text-slate-600 text-xs">carregados</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-100/70">
          <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-purple-800 font-bold text-sm">{totalElements}</span>
          <span className="text-slate-600 text-xs">total</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${authLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-slate-700 font-semibold text-sm">AuthLoad</span>
          <span className={`text-sm font-bold ${authLoading ? 'text-amber-600' : 'text-emerald-600'}`}>
            {authLoading ? '⏳' : '✓'}
          </span>
        </div>
      </div>
    </div>
  )
}

