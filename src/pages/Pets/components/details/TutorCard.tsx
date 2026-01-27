import type { Tutor } from '../../../../types'

export function TutorCard({ tutor }: { tutor: Tutor }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow border border-slate-100">
      <h2 className="text-lg font-bold text-indigo-600 mb-5">Tutor Responsável</h2>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-xl font-bold">
          {tutor.nome.charAt(0).toUpperCase()}
        </div>

        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{tutor.nome}</span>
          {tutor.email && <span className="text-sm text-slate-600">{tutor.email}</span>}
          {tutor.telefone && <span className="text-sm text-slate-600">{tutor.telefone}</span>}
          {tutor.endereco && <span className="text-sm text-slate-600">{tutor.endereco}</span>}
        </div>
      </div>
    </div>
  )
}

