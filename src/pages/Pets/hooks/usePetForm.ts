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
    store.reset(mode, petId)
    if (mode === 'edit' && petId && isAuthenticated && !authLoading) {
      void store.loadPet(petId)
    }
  }, [store, mode, petId, isAuthenticated, authLoading])

  useEffect(() => () => store.dispose(), [store])

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
    photoFile: snap.photoFile,
    onPickPhoto: store.onPickPhoto,

    fieldErrors: snap.fieldErrors,
    submit: () => store.submit((path) => navigate(path)),
    cancel: () => navigate('/'),
  }
}

