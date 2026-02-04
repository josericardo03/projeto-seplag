import { Link } from 'react-router-dom'
import type { Pet } from '../../../types'
import { Field } from '../../../components/ui/Field'
import { NumberLikeInput } from '../../../components/ui/Inputs'
import { Button } from '../../../components/ui/Button'

function getPetPhotoUrl(pet: Pet) {
  return pet.foto?.url || null
}

export function TutorPetsLinker(props: {
  tutorId: number
  pets: Pet[]
  petsLoading?: boolean
  petIdText: string
  petIdError?: string
  disabled?: boolean
  onChangePetId: (v: string) => void
  onLink: () => void
  onUnlinkById: () => void
  onUnlink: (petId: number) => void
}) {
  const { tutorId, pets, petsLoading, petIdText, petIdError, disabled, onChangePetId, onLink, onUnlinkById, onUnlink } =
    props
  const hasPetId = petIdText.trim().length > 0

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-black/5 p-6 sm:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Pets vinculados</h2>
          <p className="text-slate-600 text-sm mt-1">
            Vincule um pet existente ao tutor (POST) ou remova o vínculo (DELETE).
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl">
          Tutor #{tutorId}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start">
        <Field label="Vincular por ID do pet" htmlFor="petId" error={petIdError} hint="Dica: pressione Enter para vincular.">
          <NumberLikeInput
            id="petId"
            value={petIdText}
            onChange={(e) => onChangePetId(e.target.value)}
            placeholder="Ex.: 288"
            disabled={!!disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hasPetId && !disabled) onLink()
            }}
          />
        </Field>

        <div className="md:mt-7 flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button
            onClick={onLink}
            disabled={!!disabled || !hasPetId}
            variant="primary"
            className="w-full md:w-auto"
          >
            Vincular
          </Button>

          <button
            type="button"
            onClick={onUnlinkById}
            disabled={!!disabled || !hasPetId}
            className="inline-flex items-center justify-center w-full sm:w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-700 hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
            title="Desvincular por ID"
            aria-label="Desvincular por ID"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0h8m-1 0l-1-2H10L9 7z"
              />
            </svg>
          </button>
        </div>
      </div>

      {petsLoading ? (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-700 font-semibold">Atualizando pets vinculados...</p>
        </div>
      ) : pets.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center">
          <p className="text-slate-700 font-semibold">Nenhum pet vinculado</p>
          <p className="text-slate-600 text-sm mt-1">Use o campo acima para vincular um pet existente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {getPetPhotoUrl(pet) ? (
                      <img
                        src={getPetPhotoUrl(pet)!}
                        alt={pet.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                        🐾
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-slate-900 font-bold truncate">{pet.nome}</p>
                    <p className="text-slate-600 text-sm truncate">
                      #{pet.id} • {pet.especie || '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/pets/${pet.id}`}
                    className="text-indigo-600 font-semibold text-sm hover:text-indigo-700"
                    title="Ver pet"
                  >
                    Ver
                  </Link>

                  <button
                    type="button"
                    onClick={() => onUnlink(pet.id)}
                    disabled={!!disabled}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 border border-red-100 text-red-700 hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Desvincular"
                    aria-label={`Desvincular ${pet.nome}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0h8m-1 0l-1-2H10L9 7z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Clique na lixeira para desvincular imediatamente.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

