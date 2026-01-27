import { Link } from 'react-router-dom'
import { PetsHeader } from './components/shared/PetsHeader'
import { FullPageSpinner, RenderError } from './components/shared/PageStates'
import { usePetDetails } from './hooks/usePetDetails'
import { SpeciesBadge } from './components/details/SpeciesBadge'
import { PetMediaCard } from './components/details/PetMediaCard'
import { PetInfoCard } from './components/details/PetInfoCard'
import { TutorCard } from './components/details/TutorCard'

export default function PetDetails() {
  const { authLoading, isAuthenticated, loading, error, pet, tutores } = usePetDetails()

  if (authLoading) return <FullPageSpinner label="Carregando..." />
  if (!isAuthenticated) return null

  if (loading) return <FullPageSpinner label="Carregando informações..." />

  if (error || !pet) {
    return (
      <RenderError
        message={error || 'Pet não encontrado'}
        actions={
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Voltar
          </Link>
        }
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <PetsHeader />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <Link to="/" className="inline-flex items-center text-sm text-slate-600 hover:text-indigo-600">
            ← Voltar para lista
          </Link>

          <Link
            to={`/pets/${pet.id}/editar`}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition w-full sm:w-auto"
          >
            Editar pet
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <PetMediaCard name={pet.nome} imageUrl={pet.foto?.url} />

          <div className="flex flex-col">
            {pet.especie && <SpeciesBadge species={pet.especie} />}

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6">
              {pet.nome}
            </h1>

            <PetInfoCard pet={pet} />

            {tutores.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-extrabold text-slate-900">Tutores vinculados</h2>
                {tutores.map((t) => (
                  <TutorCard key={t.id} tutor={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
