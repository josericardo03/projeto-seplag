import { Link } from 'react-router-dom'
import type { Tutor } from '../../../types'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] || '?'
  const b = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (a + b).toUpperCase()
}

export function TutorCard({ tutor }: { tutor: Tutor }) {
  const photoUrl = typeof tutor.foto === 'string' ? tutor.foto : tutor.foto?.url
  const placeholder = '/animal-placeholder.svg'
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-black/5 p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-extrabold shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt={tutor.nome} className="w-full h-full object-cover" />
            ) : (
              <img src={placeholder} alt="Tutor sem foto" className="w-full h-full object-contain p-2 bg-white/20" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 font-extrabold truncate">{tutor.nome}</p>
            <p className="text-slate-600 text-sm truncate">{tutor.email || '—'}</p>
          </div>
        </div>

        <Link
          to={`/tutores/${tutor.id}/editar`}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shrink-0"
        >
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
          <p className="text-slate-500 text-xs font-semibold">Telefone</p>
          <p className="text-slate-800 font-semibold">{tutor.telefone || '—'}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
          <p className="text-slate-500 text-xs font-semibold">CPF</p>
          <p className="text-slate-800 font-semibold">{tutor.cpf ? String(tutor.cpf) : '—'}</p>
        </div>
        {tutor.endereco && (
          <div className="sm:col-span-2 rounded-2xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-500 text-xs font-semibold">Endereço</p>
            <p className="text-slate-800 font-semibold">{tutor.endereco}</p>
          </div>
        )}
      </div>
    </div>
  )
}

