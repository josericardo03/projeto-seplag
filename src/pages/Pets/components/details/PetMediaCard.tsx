import { useState } from 'react'

export function PetMediaCard({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const [imgError, setImgError] = useState(false)
  const hasImage = !!imageUrl && !imgError

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-lg bg-slate-200 border border-black/5">
      {hasImage ? (
        <img
          src={imageUrl!}
          alt={name}
          className="w-full h-full object-cover aspect-square"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700">
          <span className="text-white text-6xl">🐾</span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
        <p className="text-white font-semibold text-lg drop-shadow line-clamp-2">{name}</p>
      </div>
    </div>
  )
}

