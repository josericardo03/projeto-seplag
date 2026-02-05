import { Link } from 'react-router-dom'
import { PetsHeader } from '../../components/layout/PetsHeader'
import { Footer } from '../../components/layout/Footer'
import { FullPageAuthError, FullPageSpinner, RenderError } from '../../components/ui/PageStates'
import { usePetForm } from './hooks/usePetForm'
import { Field } from '../../components/ui/Field'
import { NumberLikeInput, TextInput } from '../../components/ui/Inputs'
import { PhotoUploader } from './components/form/PhotoUploader'
import { FormActions } from '../../components/ui/FormActions'

export default function PetForm() {
  const {
    mode,
    authLoading,
    isAuthenticated,
    initialLoading,
    saving,
    error,
    success,
    nome,
    setNome,
    especie,
    setEspecie,
    idadeText,
    onChangeIdade,
    raca,
    setRaca,
    existingPhotoUrl,
    existingPhotoId,
    photoFile,
    onPickPhoto,
    removeExistingPhotoOnSave,
    setRemoveExistingPhotoOnSave,
    fieldErrors,
    submit,
    cancel,
  } = usePetForm()

  if (authLoading) return <FullPageSpinner label="Carregando autenticação..." />

  if (!isAuthenticated) {
    return (
      <FullPageAuthError
        onRetry={() => {
          localStorage.clear()
          window.location.reload()
        }}
      />
    )
  }

  if (initialLoading) return <FullPageSpinner label="Carregando pet..." />

  if (error && mode === 'edit' && !nome) {
    return (
      <RenderError
        message={error}
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200">
      <PetsHeader />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-slate-600 hover:text-indigo-600">
            ← Voltar
          </Link>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900">
            {mode === 'edit' ? 'Editar Pet' : 'Cadastrar Pet'}
          </h1>
          <p className="mt-2 text-slate-600">
            Preencha os campos abaixo e envie a foto (opcional).
          </p>
        </div>

        {(error || success) && (
          <div
            className={[
              'mb-6 px-5 py-4 rounded-2xl border font-semibold',
              error ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700',
            ].join(' ')}
          >
            {error || success}
          </div>
        )}

        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-black/5 p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field
              label="Nome"
              htmlFor="nome"
              error={fieldErrors.nome}
              hint="Ex.: Thor, Mel, Nina"
            >
              <TextInput
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do pet"
                disabled={saving}
                autoComplete="off"
              />
            </Field>

            <Field
              label="Espécie (opcional)"
              htmlFor="especie"
              error={fieldErrors.especie}
              hint="Ex.: Cachorro, Gato"
            >
              <TextInput
                id="especie"
                value={especie}
                onChange={(e) => setEspecie(e.target.value)}
                placeholder="Espécie"
                disabled={saving}
                autoComplete="off"
                list="species-list"
              />
              <datalist id="species-list">
                <option value="Cachorro" />
                <option value="Gato" />
                <option value="Coelho" />
                <option value="Pássaro" />
              </datalist>
            </Field>

            <Field
              label="Idade"
              htmlFor="idade"
              error={fieldErrors.idade}
              hint="Somente números (0 a 80)"
            >
              <NumberLikeInput
                id="idade"
                value={idadeText}
                onChange={(e) => onChangeIdade(e.target.value)}
                placeholder="0"
                disabled={saving}
              />
            </Field>

            <Field
              label="Raça"
              htmlFor="raca"
              hint="Opcional"
            >
              <TextInput
                id="raca"
                value={raca}
                onChange={(e) => setRaca(e.target.value)}
                placeholder="Raça"
                disabled={saving}
                autoComplete="off"
              />
            </Field>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Foto</h2>
            <PhotoUploader
              existingUrl={existingPhotoUrl}
              file={photoFile}
              disabled={saving}
              onPick={onPickPhoto}
              removeExisting={mode === 'edit' ? removeExistingPhotoOnSave : false}
              onChangeRemoveExisting={mode === 'edit' ? setRemoveExistingPhotoOnSave : undefined}
            />
          </div>

          <FormActions
            mode={mode}
            saving={saving}
            onCancel={cancel}
            onSubmit={submit}
            submitLabelCreate="Cadastrar pet"
            submitLabelEdit="Salvar alterações"
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

