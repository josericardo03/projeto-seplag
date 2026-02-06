import { useState } from 'react'

export function PetMediaCard({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const [imgError, setImgError] = useState(false)
  const hasImage = !!imageUrl && !imgError
  const placeholder = '/animal-placeholder.svg'

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-lg bg-slate-200 border border-black/5">
      {hasImage ? (
        <div className="aspect-square min-h-[240px] sm:min-h-[280px] flex items-center justify-center bg-white">
          <img
            src={imageUrl!}
            alt={name}
            className="w-full h-full max-w-full max-h-full object-contain"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="aspect-square flex items-center justify-center bg-slate-100">
          <img src={placeholder} alt="Pet sem foto" className="w-40 max-w-[60%] opacity-90" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
        <p className="text-white font-semibold text-lg drop-shadow line-clamp-2">{name}</p>
      </div>
    </div>
  )
}

