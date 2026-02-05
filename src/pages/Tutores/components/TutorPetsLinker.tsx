import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import type { Pet } from '../../../types'
import { Field } from '../../../components/ui/Field'
import { TextInput } from '../../../components/ui/Inputs'
import { Button } from '../../../components/ui/Button'
import { Pagination } from '../../../components/Pagination'
import { petService } from '../../../services/petService'
import { getErrorMessage } from '../../../utils/errors'

function getPetPhotoUrl(pet: Pet) {
  return pet.foto?.url || null
}

export function TutorPetsLinker(props: {
  tutorId: number
  pets: Pet[]
  petsLoading?: boolean
  disabled?: boolean
  onUnlink: (petId: number) => void
} & (
  | {
      // Novo fluxo (lista + seleção)
      onLinkById: (petId: number) => void
    }
  | {
      // Compatibilidade com fluxo antigo (vincular por ID)
      petIdText: string
      petIdError?: string
      onChangePetId: (v: string) => void
      onLink: () => void
      onUnlinkById: () => void
    }
)) {
  const { tutorId, pets, petsLoading, disabled, onUnlink } = props

  const onLinkById =
    'onLinkById' in props
      ? props.onLinkById
      : (petId: number) => {
          props.onChangePetId(String(petId))
          props.onLink()
        }

  const linkedIds = useMemo(() => new Set(pets.map((p) => p.id)), [pets])
  const placeholder = '/animal-placeholder.svg'

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [size] = useState(9)
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [results, setResults] = useState<Pet[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null)

  useEffect(() => {
    setSelectedPetId(null)
    setPage(0)
  }, [query])

  useEffect(() => {
    let cancelled = false
    const id = window.setTimeout(() => {
      void (async () => {
        try {
          setListLoading(true)
          setListError(null)
          const res = await petService.getPets({ page, size, nome: query.trim() || undefined })
          if (cancelled) return
          setResults(res.content || [])
          setTotalPages(res.totalPages ?? 0)
        } catch (e: unknown) {
          if (cancelled) return
          setListError(getErrorMessage(e, 'Erro ao carregar pets'))
          setResults([])
          setTotalPages(0)
        } finally {
          if (!cancelled) setListLoading(false)
        }
      })()
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [page, size, query])

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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
        <Field label="Buscar pet por nome" htmlFor="petSearch" hint="Digite para filtrar a lista abaixo.">
          <TextInput
            id="petSearch"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex.: Rex, Nina, Thor..."
            disabled={!!disabled}
            autoComplete="off"
          />
        </Field>

        <Button
          onClick={() => {
            if (!selectedPetId) return
            onLinkById(selectedPetId)
          }}
          disabled={!!disabled || !selectedPetId}
          variant="primary"
          className="w-full lg:w-auto"
        >
          Vincular pet
        </Button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/70 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900 truncate">Todos os pets</p>
            <p className="text-sm text-slate-600">
              Selecione um pet para vincular. Pets já vinculados aparecem como indisponíveis.
            </p>
          </div>
          <span className="shrink-0 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl">
            Página {page + 1} / {Math.max(1, totalPages || 1)}
          </span>
        </div>

        {listError && (
          <div className="px-5 py-4 bg-red-50 border-b border-red-100 text-red-700 font-semibold" role="alert">
            {listError}
          </div>
        )}

        {listLoading ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-700 font-semibold">Carregando pets...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-700 font-semibold">Nenhum pet encontrado</p>
            <p className="text-slate-600 text-sm mt-1">Tente alterar o termo de busca.</p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((pet) => {
              const isLinked = linkedIds.has(pet.id)
              const isSelected = selectedPetId === pet.id
              return (
                <button
                  key={pet.id}
                  type="button"
                  disabled={!!disabled || isLinked}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={[
                    'text-left bg-white rounded-2xl border shadow-sm p-4 flex gap-3 items-start transition',
                    isLinked ? 'opacity-60 cursor-not-allowed border-slate-100' : 'hover:shadow-md border-slate-100',
                    isSelected ? 'ring-2 ring-indigo-500 border-indigo-200' : '',
                  ].join(' ')}
                  aria-label={isLinked ? `${pet.nome} já vinculado` : `Selecionar ${pet.nome}`}
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {getPetPhotoUrl(pet) ? (
                      <img src={getPetPhotoUrl(pet)!} alt={pet.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img src={placeholder} alt="Pet sem foto" className="w-10 h-10 opacity-80" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-slate-900 font-extrabold truncate">{pet.nome}</p>
                      <input
                        type="radio"
                        name="pet-to-link"
                        checked={isSelected}
                        disabled={isLinked}
                        onChange={() => setSelectedPetId(pet.id)}
                        className="mt-1"
                        aria-label={isLinked ? 'Pet já vinculado' : 'Selecionar para vincular'}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <p className="text-sm text-slate-600 truncate">
                      #{pet.id} • {pet.especie || '—'} {pet.raca ? `• ${pet.raca}` : ''}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Link
                        to={`/pets/${pet.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-600 font-semibold text-sm hover:text-indigo-700"
                        title="Ver pet"
                      >
                        Ver
                      </Link>
                      {isLinked ? (
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full">
                          Vinculado
                        </span>
                      ) : (
                        <span className="text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full">
                          Disponível
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="px-5 pb-6">
          <Pagination currentPage={page} totalPages={totalPages || 0} onPage={setPage} />
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

