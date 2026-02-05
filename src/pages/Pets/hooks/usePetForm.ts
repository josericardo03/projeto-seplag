import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { createPetFormStore } from '../../../state/petFormStore'
import { useBehaviorSubjectValue } from '../../../state/useBehaviorSubject'

type Mode = 'create' | 'edit'

export function usePetForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()

  const petId = useMemo(() => {
    if (!id) return null
    const n = Number(id)
    return Number.isFinite(n) ? n : null
  }, [id])

  const mode: Mode = petId ? 'edit' : 'create'

  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const store = useMemo(() => createPetFormStore(), [])
  const snap = useBehaviorSubjectValue(store.subject)

  useEffect(() => {
    const shouldLoad = mode === 'edit' && !!petId && isAuthenticated && !authLoading
    store.reset(mode, petId, shouldLoad)
    if (shouldLoad && petId) void store.loadPet(petId)
  }, [store, mode, petId, isAuthenticated, authLoading])

  return {
    mode,
    petId,
    authLoading,
    isAuthenticated,
    initialLoading: snap.initialLoading,
    saving: snap.saving,
    error: snap.error,
    success: snap.success,

    nome: snap.nome,
    setNome: store.setNome,
    especie: snap.especie,
    setEspecie: store.setEspecie,
    idadeText: snap.idadeText,
    onChangeIdade: store.onChangeIdade,
    raca: snap.raca,
    setRaca: store.setRaca,

    existingPhotoUrl: snap.existingPhotoUrl,
    existingPhotoId: snap.existingPhotoId,
    photoFile: snap.photoFile,
    onPickPhoto: store.onPickPhoto,
    removeExistingPhotoOnSave: snap.removeExistingPhotoOnSave,
    setRemoveExistingPhotoOnSave: store.setRemoveExistingPhotoOnSave,

    fieldErrors: snap.fieldErrors,
    submit: () => store.submit((path) => navigate(path)),
    cancel: () => navigate('/'),
  }
}

