import { Link } from 'react-router-dom'
import { PetsHeader } from '../Pets/components/shared/PetsHeader'
import { FullPageAuthError, FullPageSpinner, RenderError } from '../Pets/components/shared/PageStates'
import { Field } from '../Pets/components/form/Field'
import { NumberLikeInput, TextInput } from '../Pets/components/form/Inputs'
import { FormActions } from '../Pets/components/form/FormActions'
import { useTutorForm } from './hooks/useTutorForm'
import { TutorPhotoUploader } from './components/TutorPhotoUploader'
import { TutorPetsLinker } from './components/TutorPetsLinker'

export default function TutorForm() {
  const {
    mode,
    tutorId,
    authLoading,
    isAuthenticated,
    initialLoading,
    saving,
    linking,
    error,
    success,
    fieldErrors,
    nome,
    setNome,
    email,
    setEmail,
    telefone,
    onChangeTelefone,
    endereco,
    setEndereco,
    cpf,
    onChangeCpf,
    existingPhotoUrl,
    existingPhotoId,
    photoFile,
    onPickPhoto,
    removeExistingPhoto,
    removingPhoto,
    pets,
    petsLoading,
    petIdText,
    setPetIdText,
    linkPet,
    unlinkPet,
    unlinkPetByInput,
    submit,
    cancel,
  } = useTutorForm()

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

  if (initialLoading) return <FullPageSpinner label="Carregando tutor..." />

  if (error && mode === 'edit' && !nome) {
    return (
      <RenderError
        message={error}
        actions={
          <Link
            to="/tutores"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Voltar
          </Link>
        }
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200">
      <PetsHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="mb-2">
          <Link to="/tutores" className="inline-flex items-center text-sm text-slate-600 hover:text-indigo-600">
            ← Voltar
          </Link>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900">
            {mode === 'edit' ? 'Editar Tutor' : 'Cadastrar Tutor'}
          </h1>
          <p className="mt-2 text-slate-600">Cadastre/edite o tutor e gerencie os pets vinculados.</p>
        </div>

        {(error || success) && (
          <div
            className={[
              'px-5 py-4 rounded-2xl border font-semibold',
              error ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700',
            ].join(' ')}
          >
            {error || success}
          </div>
        )}

        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-black/5 p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Nome completo" htmlFor="nome" error={fieldErrors.nome}>
              <TextInput
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do tutor"
                disabled={saving || linking}
                autoComplete="off"
              />
            </Field>

            <Field label="Email" htmlFor="email" error={fieldErrors.email} hint="Obrigatório">
              <TextInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                disabled={saving || linking}
                autoComplete="email"
              />
            </Field>

            <Field label="CPF" htmlFor="cpf" error={fieldErrors.cpf} hint="Obrigatório. Ex.: 123.456.789-01">
              <NumberLikeInput
                id="cpf"
                value={cpf}
                onChange={(e) => onChangeCpf(e.target.value)}
                placeholder="000.000.000-00"
                disabled={saving || linking}
              />
            </Field>

            <Field label="Telefone" htmlFor="telefone" error={fieldErrors.telefone} hint="Opcional. Ex.: (11) 91234-5678">
              <NumberLikeInput
                id="telefone"
                value={telefone}
                onChange={(e) => onChangeTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                disabled={saving || linking}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Endereço" htmlFor="endereco" hint="Opcional">
                <TextInput
                  id="endereco"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                  disabled={saving || linking}
                  autoComplete="off"
                />
              </Field>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Foto</h2>
            <TutorPhotoUploader
              existingUrl={existingPhotoUrl}
              existingId={existingPhotoId}
              file={photoFile}
              disabled={saving || linking}
              onPick={onPickPhoto}
              onRemoveRemote={mode === 'edit' ? removeExistingPhoto : undefined}
              removingRemote={removingPhoto}
            />
          </div>

          <FormActions mode={mode} saving={saving} onCancel={cancel} onSubmit={submit} />
        </div>

        {mode === 'edit' && tutorId && (
          <TutorPetsLinker
            tutorId={tutorId}
            pets={pets}
            petsLoading={petsLoading}
            petIdText={petIdText}
            petIdError={fieldErrors.petId}
            disabled={saving || linking}
            onChangePetId={setPetIdText}
            onLink={linkPet}
            onUnlinkById={unlinkPetByInput}
            onUnlink={unlinkPet}
          />
        )}
      </main>
    </div>
  )
}

