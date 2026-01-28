import { useEffect, useMemo } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { tutoresListStore } from '../../../state/tutoresListStore'
import { useBehaviorSubjectValue } from '../../../state/useBehaviorSubject'
import { applyTutorFilters, hasActiveTutorFilters } from '../../../utils/filters'

export interface UseTutoresListOptions {
  pageSize?: number
  pollingMs?: number
}

export function useTutoresList(options: UseTutoresListOptions = {}) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const snap = useBehaviorSubjectValue(tutoresListStore.subject)

  useEffect(() => {
    tutoresListStore.configure({ pageSize: options.pageSize, pollingMs: options.pollingMs })
  }, [options.pageSize, options.pollingMs])

  useEffect(() => {
    if (!isAuthenticated || authLoading) return
    const unmount = tutoresListStore.mount()
    return () => unmount()
  }, [isAuthenticated, authLoading])

  const filters = useMemo(
    () => ({
      hasEmail: snap.hasEmail,
      hasPhone: snap.hasPhone,
      hasCpf: snap.hasCpf,
      hasPhoto: snap.hasPhoto,
    }),
    [snap.hasCpf, snap.hasEmail, snap.hasPhone, snap.hasPhoto]
  )

  const tutoresFiltered = useMemo(() => applyTutorFilters(snap.tutores, filters), [snap.tutores, filters])
  const filtersActive = useMemo(() => hasActiveTutorFilters(filters), [filters])

  const emptyMessage = useMemo(() => {
    const term = snap.searchTerm.trim()
    if (filtersActive) return 'Nenhum resultado com os filtros aplicados'
    if (term) return `Nenhum resultado para "${term}"`
    return 'Não há tutores cadastrados no sistema'
  }, [snap.searchTerm, filtersActive])

  return {
    authLoading,
    isAuthenticated,
    tutores: tutoresFiltered,
    tutoresRawCount: snap.tutores.length,
    tutoresFilteredCount: tutoresFiltered.length,
    loading: snap.loading,
    refreshing: snap.refreshing,
    error: snap.error,
    searchTerm: snap.searchTerm,
    setSearchTerm: tutoresListStore.setSearchTerm,
    currentPage: snap.currentPage,
    totalPages: snap.totalPages,
    totalElements: snap.totalElements,
    search: tutoresListStore.search,
    clearSearch: tutoresListStore.clearSearch,
    goToPage: tutoresListStore.goToPage,
    reload: tutoresListStore.reload,
    emptyMessage,

    hasEmail: snap.hasEmail,
    setHasEmail: tutoresListStore.setHasEmail,
    hasPhone: snap.hasPhone,
    setHasPhone: tutoresListStore.setHasPhone,
    hasCpf: snap.hasCpf,
    setHasCpf: tutoresListStore.setHasCpf,
    hasPhoto: snap.hasPhoto,
    setHasPhoto: tutoresListStore.setHasPhoto,
    clearFilters: tutoresListStore.clearFilters,
    filtersActive,
  }
}

