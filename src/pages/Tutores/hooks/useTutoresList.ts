import { useEffect, useMemo } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { tutoresListStore } from '../../../state/tutoresListStore'
import { useBehaviorSubjectValue } from '../../../state/useBehaviorSubject'

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

  const emptyMessage = useMemo(() => {
    const term = snap.searchTerm.trim()
    if (term) return `Nenhum resultado para "${term}"`
    return 'Não há tutores cadastrados no sistema'
  }, [snap.searchTerm])

  return {
    authLoading,
    isAuthenticated,
    tutores: snap.tutores,
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
  }
}

