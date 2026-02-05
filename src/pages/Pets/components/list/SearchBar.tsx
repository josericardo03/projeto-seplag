import type { KeyboardEvent } from 'react'

export interface SearchBarProps {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
  className?: string
  showHint?: boolean
}

export function SearchBar({ value, disabled, onChange, onSearch, onClear, className, showHint = true }: SearchBarProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className={className ?? 'max-w-2xl'}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            type="text"
            placeholder="Buscar pet por nome..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full pl-11 pr-11 py-3.5 bg-white border border-stone-200 rounded-xl text-base text-stone-900 placeholder:text-stone-400 outline-none transition focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />

          {value.trim().length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="absolute inset-y-0 right-3 inline-flex items-center justify-center w-8 h-8 my-auto rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition"
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
          className="px-5 py-3.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          disabled={!!disabled}
        >
          Buscar
        </button>
      </div>

      {showHint && (
        <p className="mt-2 text-xs text-stone-500">
          Pressione <kbd className="font-mono text-stone-600">Enter</kbd> para buscar.
        </p>
      )}
    </div>
  )
}

