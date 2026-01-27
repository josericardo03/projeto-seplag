import type { Pet } from '../../../../types'

export function PetInfoCard({ pet }: { pet: Pet }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow border border-slate-100 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <span className="text-xs text-slate-500">Idade</span>
        <p className="text-lg font-semibold text-slate-800">
          {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
        </p>
      </div>

      {pet.raca && (
        <div>
          <span className="text-xs text-slate-500">Raça</span>
          <p className="text-lg font-semibold text-slate-800">{pet.raca}</p>
        </div>
      )}
    </div>
  )
}

