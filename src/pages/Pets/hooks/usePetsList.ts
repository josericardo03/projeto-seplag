import { useEffect, useMemo } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { petsListStore } from '../../../state/petsListStore'
import { useBehaviorSubjectValue } from '../../../state/useBehaviorSubject'

export interface UsePetsListOptions {
  pageSize?: number
  pollingMs?: number
}

export function usePetsList(options: UsePetsListOptions = {}) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const snap = useBehaviorSubjectValue(petsListStore.subject)

  useEffect(() => {
    petsListStore.configure({ pageSize: options.pageSize, pollingMs: options.pollingMs })
  }, [options.pageSize, options.pollingMs])

  useEffect(() => {
    if (!isAuthenticated || authLoading) return
    const unmount = petsListStore.mount()
    return () => unmount()
  }, [isAuthenticated, authLoading])

  const emptyMessage = useMemo(() => {
    const term = snap.searchTerm.trim()
    if (term) return `Nenhum resultado para "${term}"`
    return 'Não há pets cadastrados no sistema'
  }, [snap.searchTerm])

  return {
    authLoading,
    isAuthenticated,

    pets: snap.pets,
    loading: snap.loading,
    refreshing: snap.refreshing,
    error: snap.error,

    searchTerm: snap.searchTerm,
    setSearchTerm: petsListStore.setSearchTerm,
    appliedSearchTerm: snap.appliedSearchTerm,

    currentPage: snap.currentPage,
    totalPages: snap.totalPages,
    totalElements: snap.totalElements,
    pageSize: snap.pageSize,

    search: petsListStore.search,
    clearSearch: petsListStore.clearSearch,
    goToPage: petsListStore.goToPage,
    reload: petsListStore.reload,
    emptyMessage,
  }
}

