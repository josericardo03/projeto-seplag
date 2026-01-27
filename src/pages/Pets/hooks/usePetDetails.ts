import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { petService } from '../../../services/petService'
import { tutorService } from '../../../services/tutorService'
import type { Pet, Tutor } from '../../../types'
import { useAuth } from '../../../hooks/useAuth'

export function usePetDetails() {
  const { id } = useParams<{ id: string }>()
  const petId = useMemo(() => Number(id), [id])

  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [pet, setPet] = useState<Pet | null>(null)
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!Number.isFinite(petId)) {
        setError('ID inválido')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setTutor(null)

        const petData = await petService.getPetById(petId)
        setPet(petData)

        if (petData.tutorId) {
          const tutorData = await tutorService.getTutorById(petData.tutorId)
          setTutor(tutorData)
        }
      } catch (err: any) {
        setPet(null)
        setTutor(null)
        setError(err?.response?.data?.message || 'Erro ao carregar dados do pet')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && !authLoading) void load()
  }, [petId, isAuthenticated, authLoading])

  return {
    petId,
    authLoading,
    isAuthenticated,
    pet,
    tutor,
    loading,
    error,
  }
}

