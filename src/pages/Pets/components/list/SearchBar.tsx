import type { KeyboardEvent } from 'react'

export interface SearchBarProps {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
}

export function SearchBar({ value, disabled, onChange, onSearch, onClear }: SearchBarProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            type="text"
            placeholder="Buscar pet por nome..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full pl-11 pr-11 py-3.5 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          {value.trim().length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="absolute inset-y-0 right-3 inline-flex items-center justify-center w-8 h-8 my-auto rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Limpar busca"
              title="Limpar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onSearch}
          className="px-5 py-3.5 rounded-2xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={!!disabled}
        >
          Buscar
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Dica: pressione <span className="font-semibold">Enter</span> para buscar.
      </p>
    </div>
  )
}

