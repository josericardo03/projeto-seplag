import { BehaviorSubject } from 'rxjs'
import { petService, type PetListParams } from '../services/petService'
import type { PageableResponse, Pet } from '../types'
import { authStore } from './authStore'
import { getErrorMessage } from '../utils/errors'

type Mode = 'full' | 'soft'

/** Quantidade de itens buscados da API para filtrar por nome (contém) no cliente */
const SEARCH_FETCH_SIZE = 200

export type PetsListState = {
  pets: Pet[]
  loading: boolean
  refreshing: boolean
  error: string | null

  searchTerm: string
  appliedSearchTerm: string
  /** Lista filtrada por nome (contém) no cliente; quando preenchida, paginação é em memória */
  searchFilteredPets: Pet[] | null

  speciesFilter: string
  breedFilter: string
  ageMinText: string
  ageMaxText: string

  currentPage: number
  totalPages: number
  totalElements: number

  pageSize: number
  pollingMs: number
}

const initial: PetsListState = {
  pets: [],
  loading: true,
  refreshing: false,
  error: null,
  searchTerm: '',
  appliedSearchTerm: '',
  searchFilteredPets: null,
  speciesFilter: '',
  breedFilter: '',
  ageMinText: '',
  ageMaxText: '',
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  pageSize: 10,
  pollingMs: 10_000,
}

const subject = new BehaviorSubject<PetsListState>(initial)

let mountedCount = 0
let pollId: number | null = null
let lastAuth = authStore.subject.getValue()
let visible = typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'

function set(patch: Partial<PetsListState>) {
  subject.next({ ...subject.getValue(), ...patch })
}

function isAuthedReady() {
  const a = authStore.subject.getValue()
  return !!a.isAuthenticated && !a.isLoading
}

async function fetchPets(page: number, nome?: string, pageSizeOverride?: number) {
  const s = subject.getValue()
  const size = pageSizeOverride ?? s.pageSize
  const params: PetListParams = {
    page,
    size,
    ...(nome && nome.trim() && { nome: nome.trim() }),
  }
  const response: PageableResponse<Pet> = await petService.getPets(params)
  return response
}

/** Filtra por nome contendo o termo (case insensitive) — ex.: "ico" encontra "Pitico" */
function filterPetsByNameContains(pets: Pet[], term: string): Pet[] {
  const t = term.trim().toLowerCase()
  if (!t) return pets
  return pets.filter((p) => (p.nome || '').toLowerCase().includes(t))
}

async function loadPage(page: number, mode: Mode = 'full') {
  const s = subject.getValue()
  if (s.searchFilteredPets !== null) {
    return
  }
  const hasData = s.pets.length > 0
  const soft = mode === 'soft' && hasData

  try {
    set({ error: null })
    if (soft) set({ refreshing: true })
    else set({ loading: true })

    const response = await fetchPets(page, undefined)
    const petsArray = response.content || []
    set({
      pets: petsArray,
      totalPages: response.totalPages || 0,
      totalElements: response.totalElements || 0,
      currentPage: response.number || 0,
    })
  } catch (e: unknown) {
    set({
      pets: [],
      totalPages: 0,
      totalElements: 0,
      currentPage: 0,
      error: getErrorMessage(e, 'Erro ao carregar pets'),
    })
  } finally {
    set({ loading: false, refreshing: false })
  }
}

async function search() {
  const s = subject.getValue()
  const term = s.searchTerm.trim()
  set({ appliedSearchTerm: term, currentPage: 0, searchFilteredPets: null })
  if (!term) {
    await loadPage(0, 'full')
    return
  }
  try {
    set({ loading: true, refreshing: false, error: null })
    const response = await fetchPets(0, undefined, SEARCH_FETCH_SIZE)
    const all = response.content || []
    const filtered = filterPetsByNameContains(all, term)
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / s.pageSize))
    set({
      searchFilteredPets: filtered,
      pets: filtered.slice(0, s.pageSize),
      totalPages,
      totalElements: total,
      currentPage: 0,
    })
  } catch (e: unknown) {
    set({
      searchFilteredPets: null,
      pets: [],
      totalPages: 0,
      totalElements: 0,
      currentPage: 0,
      error: getErrorMessage(e, 'Erro ao buscar pets'),
    })
  } finally {
    set({ loading: false })
  }
}

async function refreshSearchResults() {
  const s = subject.getValue()
  const term = s.appliedSearchTerm?.trim()
  if (!term || s.searchFilteredPets === null) return
  try {
    set({ error: null, refreshing: true })
    const response = await fetchPets(0, undefined, SEARCH_FETCH_SIZE)
    const all = response.content || []
    const filtered = filterPetsByNameContains(all, term)
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / s.pageSize))
    const page = Math.min(s.currentPage, totalPages - 1)
    const start = page * s.pageSize
    set({
      searchFilteredPets: filtered,
      pets: filtered.slice(start, start + s.pageSize),
      totalPages,
      totalElements: total,
      currentPage: page,
      refreshing: false,
    })
  } catch (e: unknown) {
    set({
      refreshing: false,
      error: getErrorMessage(e, 'Erro ao atualizar busca'),
    })
  }
}

async function clearSearch() {
  set({ searchTerm: '', appliedSearchTerm: '', searchFilteredPets: null, currentPage: 0 })
  await loadPage(0, 'full')
}

async function goToPage(page: number) {
  const s = subject.getValue()
  if (s.searchFilteredPets !== null) {
    const start = page * s.pageSize
    const pets = s.searchFilteredPets.slice(start, start + s.pageSize)
    set({ pets, currentPage: page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  await loadPage(page, 'full')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function stopPolling() {
  if (pollId !== null) window.clearInterval(pollId)
  pollId = null
}

function startPolling() {
  stopPolling()
  const s = subject.getValue()
  if (!s.pollingMs || s.pollingMs <= 0) return
  if (!visible) return
  pollId = window.setInterval(() => {
    const state = subject.getValue()
    if (state.appliedSearchTerm && state.searchFilteredPets !== null) {
      void refreshSearchResults()
    } else {
      void loadPage(state.currentPage, 'soft')
    }
  }, s.pollingMs)
}

function reconcile() {
  if (mountedCount <= 0) {
    stopPolling()
    return
  }
  if (!isAuthedReady()) {
    stopPolling()
    return
  }
  startPolling()
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    visible = document.visibilityState !== 'hidden'
    reconcile()
  })
}

function mount() {
  mountedCount += 1
  if (mountedCount === 1 && isAuthedReady()) {
    void loadPage(subject.getValue().currentPage ?? 0, 'full')
  }
  reconcile()
  return () => {
    mountedCount = Math.max(0, mountedCount - 1)
    reconcile()
  }
}

function configure(options: { pageSize?: number; pollingMs?: number }) {
  const patch: Partial<PetsListState> = {}
  if (typeof options.pageSize === 'number') patch.pageSize = options.pageSize
  if (typeof options.pollingMs === 'number') patch.pollingMs = options.pollingMs
  set(patch)
  reconcile()
}

authStore.subject.subscribe((a) => {
  const prev = lastAuth
  lastAuth = a
  if (prev.isAuthenticated && !a.isAuthenticated) {
    stopPolling()
    const s = subject.getValue()
    set({
      pets: [],
      loading: true,
      refreshing: false,
      error: null,
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      searchTerm: '',
      appliedSearchTerm: '',
      searchFilteredPets: null,
      speciesFilter: '',
      breedFilter: '',
      ageMinText: '',
      ageMaxText: '',
      pageSize: s.pageSize,
      pollingMs: s.pollingMs,
    })
  }
  if (!prev.isAuthenticated && a.isAuthenticated && !a.isLoading && mountedCount > 0) {
    void loadPage(0, 'full')
  }
  reconcile()
})

export const petsListStore = {
  subject,
  configure,
  mount,
  setSearchTerm: (value: string) => set({ searchTerm: value }),
  setSpeciesFilter: (value: string) => set({ speciesFilter: value }),
  setBreedFilter: (value: string) => set({ breedFilter: value }),
  setAgeMinText: (value: string) => set({ ageMinText: value }),
  setAgeMaxText: (value: string) => set({ ageMaxText: value }),
  clearFilters: () =>
    set({
      speciesFilter: '',
      breedFilter: '',
      ageMinText: '',
      ageMaxText: '',
    }),
  search,
  clearSearch,
  goToPage,
  reload: () => {
    const s = subject.getValue()
    if (s.appliedSearchTerm && s.searchFilteredPets !== null) {
      void refreshSearchResults()
    } else {
      void loadPage(s.currentPage, 'full')
    }
  },
} as const

