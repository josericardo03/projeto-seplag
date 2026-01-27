import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Tutor } from '../../../types'
import type { PageableResponse } from '../../../types'
import { tutorService, type TutorListParams } from '../../../services/tutorService'
import { useAuth } from '../../../hooks/useAuth'

export interface UseTutoresListOptions {
  pageSize?: number
  pollingMs?: number
}

export function useTutoresList(options: UseTutoresListOptions = {}) {
  const pageSize = options.pageSize ?? 10
  const pollingMs = options.pollingMs ?? 10_000

  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [tutores, setTutores] = useState<Tutor[]>([])
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
    if (tutores.length > 0) hasDataRef.current = true
  }, [tutores.length])

  const fetch = useCallback(
    async (page: number, nome?: string) => {
      const params: TutorListParams = {
        page,
        size: pageSize,
        ...(nome && nome.trim() && { nome: nome.trim() }),
      }
      const response: PageableResponse<Tutor> = await tutorService.getTutores(params)
      setTutores(response.content || [])
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
      setCurrentPage(response.number || 0)
    },
    [pageSize]
  )

  const loadPage = useCallback(
    async (page: number, mode: 'full' | 'soft' = 'full') => {
      try {
        const soft = mode === 'soft' && hasDataRef.current
        if (soft) setRefreshing(true)
        else setLoading(true)
        setError(null)
        await fetch(page, appliedSearchTerm || undefined)
      } catch (e: any) {
        setTutores([])
        setTotalPages(0)
        setTotalElements(0)
        setCurrentPage(0)
        setError(e?.response?.data?.message || e?.message || 'Erro ao carregar tutores')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [appliedSearchTerm, fetch]
  )

  const search = useCallback(async () => {
    const term = searchTerm.trim()
    setAppliedSearchTerm(term)
    setCurrentPage(0)
    try {
      setLoading(true)
      setError(null)
      await fetch(0, term || undefined)
    } catch (e: any) {
      setTutores([])
      setTotalPages(0)
      setTotalElements(0)
      setCurrentPage(0)
      setError(e?.response?.data?.message || e?.message || 'Erro ao buscar tutores')
    } finally {
      setLoading(false)
    }
  }, [fetch, searchTerm])

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
    if (isAuthenticated && !authLoading) loadPage(0)
  }, [isAuthenticated, authLoading, loadPage])

  useEffect(() => {
    if (!isAuthenticated || authLoading) return
    if (!pollingMs || pollingMs <= 0) return
    const id = window.setInterval(() => void loadPage(currentPage, 'soft'), pollingMs)
    return () => window.clearInterval(id)
  }, [isAuthenticated, authLoading, pollingMs, currentPage, loadPage])

  const emptyMessage = useMemo(() => {
    const term = searchTerm.trim()
    if (term) return `Nenhum resultado para "${term}"`
    return 'Não há tutores cadastrados no sistema'
  }, [searchTerm])

  return {
    authLoading,
    isAuthenticated,
    tutores,
    loading,
    refreshing,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalElements,
    search,
    clearSearch,
    goToPage,
    reload: () => loadPage(currentPage),
    emptyMessage,
  }
}

