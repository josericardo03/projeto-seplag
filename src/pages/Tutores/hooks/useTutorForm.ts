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
    store.reset(mode, tutorId)
    if (mode === 'edit' && tutorId && isAuthenticated && !authLoading) {
      void store.loadTutor(tutorId)
    }
  }, [store, mode, tutorId, isAuthenticated, authLoading])

  useEffect(() => () => store.dispose(), [store])

  return {
    mode,
    tutorId,
    authLoading,
    isAuthenticated,
    initialLoading: snap.initialLoading,
    saving: snap.saving,
    linking: snap.linking,
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
    removeExistingPhoto: store.removeExistingPhoto,
    removingPhoto: snap.removingPhoto,

    pets: snap.pets,
    petsLoading: snap.petsLoading,
    petIdText: snap.petIdText,
    setPetIdText: store.setPetIdText,
    linkPet: store.linkPet,
    unlinkPet: store.unlinkPet,
    unlinkPetByInput: store.unlinkPetByInput,

    submit: () => store.submit((path) => navigate(path)),
    cancel: () => navigate('/tutores'),
  }
}

