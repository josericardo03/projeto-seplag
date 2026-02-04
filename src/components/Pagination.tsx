export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPage: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null

  const canPrev = currentPage > 0
  const canNext = currentPage < totalPages - 1

  const pages = Array.from({ length: totalPages }, (_, i) => i)
  const windowSize = 5
  const start = Math.max(0, currentPage - Math.floor(windowSize / 2))
  const end = Math.min(totalPages, start + windowSize)
  const visible = pages.slice(start, end)

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onPage(currentPage - 1)}
        disabled={!canPrev}
        className="btn-secondary btn-sm w-full sm:w-auto disabled:opacity-50"
      >
        Anterior
      </button>

      <div className="flex items-center justify-center flex-wrap gap-2">
        {start > 0 && (
          <>
            <button
              type="button"
              onClick={() => onPage(0)}
              className="w-10 h-10 rounded-xl bg-white/80 border border-slate-200 shadow-sm text-slate-700 font-semibold hover:bg-white transition"
            >
              1
            </button>
            <span className="px-2 text-slate-500">…</span>
          </>
        )}

        {visible.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={[
              'w-10 h-10 rounded-xl border shadow-sm font-semibold transition',
              p === currentPage
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white',
            ].join(' ')}
          >
            {p + 1}
          </button>
        ))}

        {end < totalPages && (
          <>
            <span className="px-2 text-slate-500">…</span>
            <button
              type="button"
              onClick={() => onPage(totalPages - 1)}
              className="w-10 h-10 rounded-xl bg-white/80 border border-slate-200 shadow-sm text-slate-700 font-semibold hover:bg-white transition"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => onPage(currentPage + 1)}
        disabled={!canNext}
        className="btn-secondary btn-sm w-full sm:w-auto disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  )
}

