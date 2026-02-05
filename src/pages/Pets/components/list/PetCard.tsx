import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Pet } from '../../../../types'

function especieBadgeClass(especie?: string) {
  const e = (especie || '').toLowerCase()
  if (e === 'cachorro' || e === 'cão') return 'bg-gradient-to-r from-pink-400 to-red-500'
  if (e) return 'bg-gradient-to-r from-blue-400 to-cyan-400'
  return 'bg-gradient-to-r from-slate-400 to-slate-500'
}

export function PetCard({ pet }: { pet: Pet }) {
  const [imgError, setImgError] = useState(false)
  const hasImage = !!pet.foto?.url && !imgError
  const placeholder = '/animal-placeholder.svg'

  return (
    <Link
      to={`/pets/${pet.id}`}
      className="group block bg-white rounded-3xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 border border-black/5 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl"
    >
      <div className="relative h-56 bg-slate-100 overflow-hidden">
        {hasImage ? (
          <img
            src={pet.foto!.url}
            alt={pet.nome}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src={placeholder}
            alt="Pet sem foto"
            className="w-full h-full object-contain p-10 opacity-90"
          />
        )}

        {pet.especie && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={[
                'px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg backdrop-blur-md',
                especieBadgeClass(pet.especie),
              ].join(' ')}
            >
              {pet.especie}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
          {pet.nome}
        </h3>

        <div className="flex flex-col gap-3">
          {typeof pet.idade === 'number' && (
            <div className="flex items-center text-gray-600 px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium">
                {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
              </span>
            </div>
          )}

          {pet.raca && (
            <div className="flex items-center text-gray-600 px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-pink-400 to-red-500 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium">{pet.raca}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

