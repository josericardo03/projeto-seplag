import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [tutores, setTutores] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

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
        setTutores([])

        const petData = await petService.getPetById(petId)
        setPet(petData)

        const tutorsFromPet = Array.isArray((petData as any).tutores) ? ((petData as any).tutores as Tutor[]) : []
        if (tutorsFromPet.length > 0) {
          setTutores(tutorsFromPet)
          const ids = tutorsFromPet.map((t) => t.id).filter((x) => Number.isFinite(x))
          const results = await Promise.allSettled(ids.map((tid) => tutorService.getTutorById(tid)))
          if (!mountedRef.current) return
          const refreshed = results
            .filter((r): r is PromiseFulfilledResult<Tutor> => r.status === 'fulfilled')
            .map((r) => r.value)
          if (refreshed.length > 0) setTutores(refreshed)
        } else if (petData.tutorId) {
          const tutorData = await tutorService.getTutorById(petData.tutorId)
          if (!mountedRef.current) return
          setTutores([tutorData])
        }
      } catch (err: any) {
        setPet(null)
        setTutores([])
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
    tutores,
    loading,
    error,
  }
}

