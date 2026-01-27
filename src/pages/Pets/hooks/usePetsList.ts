import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { petService, type PetListParams } from '../../../services/petService'
import type { Pet, PageableResponse } from '../../../types'
import { useAuth } from '../../../hooks/useAuth'

export interface UsePetsListOptions {
  pageSize?: number
  pollingMs?: number
}

export function usePetsList(options: UsePetsListOptions = {}) {
  const pageSize = options.pageSize ?? 10
  const pollingMs = options.pollingMs ?? 10_000

  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const hasDataRef = useRef(false)
  useEffect(() => {
    if (pets.length > 0) hasDataRef.current = true
  }, [pets.length])

  const fetchPets = useCallback(
    async (page: number, nome?: string) => {
      const params: PetListParams = {
        page,
        size: pageSize,
        ...(nome && nome.trim() && { nome: nome.trim() }),
      }

      const response: PageableResponse<Pet> = await petService.getPets(params)

      const petsArray = response.content || []
      setPets(petsArray)
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
      setCurrentPage(response.number || 0)
    },
    [pageSize]
  )

  const loadPage = useCallback(
    async (page: number, mode: 'full' | 'soft' = 'full') => {
      try {
        const shouldSoft = mode === 'soft' && hasDataRef.current
        if (shouldSoft) setRefreshing(true)
        else setLoading(true)
        setError(null)
        await fetchPets(page, appliedSearchTerm || undefined)
      } catch (e: any) {
        setPets([])
        setTotalPages(0)
        setTotalElements(0)
        setCurrentPage(0)
        setError(e?.response?.data?.message || e?.message || 'Erro ao carregar pets')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [appliedSearchTerm, fetchPets]
  )

  const search = useCallback(async () => {
    const term = searchTerm.trim()
    setAppliedSearchTerm(term)
    setCurrentPage(0)
    try {
      setLoading(true)
      setError(null)
      await fetchPets(0, term || undefined)
    } catch (e: any) {
      setPets([])
      setTotalPages(0)
      setTotalElements(0)
      setCurrentPage(0)
      setError(e?.response?.data?.message || e?.message || 'Erro ao buscar pets')
    } finally {
      setLoading(false)
    }
  }, [fetchPets, searchTerm])

  const clearSearch = useCallback(async () => {
    setSearchTerm('')
    setAppliedSearchTerm('')
    setCurrentPage(0)
    await loadPage(0)
  }, [loadPage])

  const goToPage = useCallback(
    async (page: number) => {
      await loadPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [loadPage]
  )

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadPage(0)
    }
  }, [isAuthenticated, authLoading, loadPage])

  useEffect(() => {
    if (!isAuthenticated || authLoading) return
    if (!pollingMs || pollingMs <= 0) return

    const intervalId = window.setInterval(() => {
      void loadPage(currentPage, 'soft')
    }, pollingMs)

    return () => window.clearInterval(intervalId)
  }, [isAuthenticated, authLoading, pollingMs, currentPage, loadPage])

  const emptyMessage = useMemo(() => {
    const term = searchTerm.trim()
    if (term) return `Nenhum resultado para "${term}"`
    return 'Não há pets cadastrados no sistema'
  }, [searchTerm])

  return {
    authLoading,
    isAuthenticated,

    pets,
    loading,
    refreshing,
    error,

    searchTerm,
    setSearchTerm,
    appliedSearchTerm,

    currentPage,
    totalPages,
    totalElements,
    pageSize,

    search,
    clearSearch,
    goToPage,
    reload: () => loadPage(currentPage),
    emptyMessage,
  }
}

