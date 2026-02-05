import { useEffect, useMemo } from 'react'

export function PhotoUploader(props: {
  existingUrl?: string | null
  file: File | null
  disabled?: boolean
  onPick: (file: File | null) => void
  removeExisting?: boolean
  onChangeRemoveExisting?: (value: boolean) => void
}) {
  const { existingUrl, file, disabled, onPick, removeExisting, onChangeRemoveExisting } = props

  const localUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    if (!localUrl) return
    return () => URL.revokeObjectURL(localUrl)
  }, [localUrl])

  const isMarkedForRemoval = !!removeExisting
  const previewUrl = useMemo(() => {
    if (localUrl) return localUrl
    if (!isMarkedForRemoval) return existingUrl || null
    return null
  }, [localUrl, existingUrl, isMarkedForRemoval])
  const hasAnything = !!file || !!existingUrl || isMarkedForRemoval

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
      <div className="relative rounded-3xl overflow-hidden border border-black/5 bg-slate-200 shadow-sm">
        {previewUrl ? (
          <img src={previewUrl} alt="Foto do pet" className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <span className="text-slate-600 font-semibold">
              {isMarkedForRemoval ? 'Foto será removida' : 'Sem foto'}
            </span>
          </div>
        )}

        {hasAnything && (
          <button
            type="button"
            disabled={!!disabled}
            aria-label={isMarkedForRemoval ? 'Desfazer remoção da foto' : 'Remover foto'}
            onClick={() => {
              if (file) {
                onPick(null)
                return
              }
              if (onChangeRemoveExisting) {
                onChangeRemoveExisting(!isMarkedForRemoval)
              } else {
                onPick(null)
              }
            }}
            className={[
              'absolute top-3 right-3 inline-flex items-center justify-center',
              'w-9 h-9 rounded-full',
              'bg-black/70 text-white font-bold leading-none',
              'hover:bg-black/80 transition',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
              disabled ? 'opacity-60 cursor-not-allowed' : '',
            ].join(' ')}
          >
            ×
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!!disabled}
              onChange={(e) => onPick(e.target.files?.[0] || null)}
            />
            Escolher foto
          </label>
        </div>

        <p className="text-xs text-slate-500">
          Formatos aceitos: JPG/PNG/WebP. Preferível imagem quadrada.
        </p>
        {isMarkedForRemoval && !file && !!existingUrl && (
          <p className="text-xs text-slate-600">
            A remoção só será aplicada ao clicar em <span className="font-semibold">Salvar alterações</span>.
          </p>
        )}
      </div>
    </div>
  )
}

