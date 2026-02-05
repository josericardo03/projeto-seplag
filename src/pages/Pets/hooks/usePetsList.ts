import { useEffect, useMemo } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { petsListStore } from '../../../state/petsListStore'
import { useBehaviorSubjectValue } from '../../../state/useBehaviorSubject'
import { applyPetFilters, hasActivePetFilters } from '../../../utils/filters'

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

  const filters = useMemo(
    () => ({
      speciesFilter: snap.speciesFilter,
      breedFilter: snap.breedFilter,
      ageMinText: snap.ageMinText,
      ageMaxText: snap.ageMaxText,
    }),
    [snap.ageMaxText, snap.ageMinText, snap.breedFilter, snap.speciesFilter]
  )

  const petsFiltered = useMemo(() => applyPetFilters(snap.pets, filters), [snap.pets, filters])
  const filtersActive = useMemo(() => hasActivePetFilters(filters), [filters])

  const emptyMessage = useMemo(() => {
    const term = snap.searchTerm.trim()
    if (filtersActive) return 'Nenhum resultado com os filtros aplicados'
    if (term) return `Nenhum resultado para "${term}"`
    return 'Não há pets cadastrados no sistema'
  }, [snap.searchTerm, filtersActive])

  return {
    authLoading,
    isAuthenticated,

    pets: petsFiltered,
    petsRawCount: snap.pets.length,
    petsFilteredCount: petsFiltered.length,
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

    speciesFilter: snap.speciesFilter,
    setSpeciesFilter: petsListStore.setSpeciesFilter,
    breedFilter: snap.breedFilter,
    setBreedFilter: petsListStore.setBreedFilter,
    ageMinText: snap.ageMinText,
    setAgeMinText: petsListStore.setAgeMinText,
    ageMaxText: snap.ageMaxText,
    setAgeMaxText: petsListStore.setAgeMaxText,
    clearFilters: petsListStore.clearFilters,
    filtersActive,
  }
}

