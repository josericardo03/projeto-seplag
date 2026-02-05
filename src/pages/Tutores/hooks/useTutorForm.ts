import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { createTutorFormStore } from '../../../state/tutorFormStore'
import { useBehaviorSubjectValue } from '../../../state/useBehaviorSubject'

type Mode = 'create' | 'edit'

export function useTutorForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()

  const tutorId = useMemo(() => {
    if (!id) return null
    const n = Number(id)
    return Number.isFinite(n) ? n : null
  }, [id])

  const mode: Mode = tutorId ? 'edit' : 'create'
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const store = useMemo(() => createTutorFormStore(), [])
  const snap = useBehaviorSubjectValue(store.subject)

  useEffect(() => {
    const shouldLoad = mode === 'edit' && !!tutorId && isAuthenticated && !authLoading
    store.reset(mode, tutorId, shouldLoad)
    if (shouldLoad && tutorId) void store.loadTutor(tutorId)
  }, [store, mode, tutorId, isAuthenticated, authLoading])

  return {
    mode,
    tutorId,
    authLoading,
    isAuthenticated,
    initialLoading: snap.initialLoading,
    saving: snap.saving,
    linking: snap.linking,
    deleting: snap.deleting,
    error: snap.error,
    success: snap.success,
    fieldErrors: snap.fieldErrors,

    nome: snap.nome,
    setNome: store.setNome,
    email: snap.email,
    setEmail: store.setEmail,
    telefone: snap.telefone,
    onChangeTelefone: store.onChangeTelefone,
    endereco: snap.endereco,
    setEndereco: store.setEndereco,
    cpf: snap.cpf,
    onChangeCpf: store.onChangeCpf,

    existingPhotoUrl: snap.existingPhotoUrl,
    existingPhotoId: snap.existingPhotoId,
    photoFile: snap.photoFile,
    onPickPhoto: store.onPickPhoto,
    removeExistingPhotoOnSave: snap.removeExistingPhotoOnSave,
    setRemoveExistingPhotoOnSave: store.setRemoveExistingPhotoOnSave,

    pets: snap.pets,
    petsLoading: snap.petsLoading,
    petIdText: snap.petIdText,
    setPetIdText: store.setPetIdText,
    linkPet: store.linkPet,
    unlinkPet: store.unlinkPet,
    unlinkPetByInput: store.unlinkPetByInput,

    submit: () => store.submit((path) => navigate(path)),
    deleteTutor: () => store.deleteTutor((path) => navigate(path)),
    cancel: () => navigate('/tutores'),
  }
}

