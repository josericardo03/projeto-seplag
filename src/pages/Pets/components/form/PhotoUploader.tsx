import { useEffect, useMemo, useState } from 'react'

export function PhotoUploader(props: {
  existingUrl?: string | null
  file: File | null
  disabled?: boolean
  onPick: (file: File | null) => void
}) {
  const { existingUrl, file, disabled, onPick } = props
  const [localUrl, setLocalUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setLocalUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setLocalUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const previewUrl = useMemo(() => localUrl || existingUrl || null, [localUrl, existingUrl])

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
      <div className="rounded-3xl overflow-hidden border border-black/5 bg-slate-200 shadow-sm">
        {previewUrl ? (
          <img src={previewUrl} alt="Foto do pet" className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <span className="text-slate-600 font-semibold">Sem foto</span>
          </div>
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

          <button
            type="button"
            disabled={!!disabled || (!file && !previewUrl)}
            onClick={() => onPick(null)}
            className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Remover
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Formatos aceitos: JPG/PNG/WebP. Preferível imagem quadrada.
        </p>
      </div>
    </div>
  )
}

