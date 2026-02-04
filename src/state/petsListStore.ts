import { BehaviorSubject } from 'rxjs'
import { petService, type PetListParams } from '../services/petService'
import type { PageableResponse, Pet } from '../types'
import { authStore } from './authStore'
import { getErrorMessage } from '../utils/errors'

type Mode = 'full' | 'soft'

export type PetsListState = {
  pets: Pet[]
  loading: boolean
  refreshing: boolean
  error: string | null

  searchTerm: string
  appliedSearchTerm: string

  speciesFilter: string
  ageMinText: string
  ageMaxText: string
  hasPhoto: boolean
  hasTutor: boolean

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
  speciesFilter: '',
  ageMinText: '',
  ageMaxText: '',
  hasPhoto: false,
  hasTutor: false,
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

async function fetchPets(page: number, nome?: string) {
  const s = subject.getValue()
  const params: PetListParams = {
    page,
    size: s.pageSize,
    ...(nome && nome.trim() && { nome: nome.trim() }),
  }
  const response: PageableResponse<Pet> = await petService.getPets(params)
  return response
}

async function loadPage(page: number, mode: Mode = 'full') {
  const s = subject.getValue()
  const hasData = s.pets.length > 0
  const soft = mode === 'soft' && hasData

  try {
    set({ error: null })
    if (soft) set({ refreshing: true })
    else set({ loading: true })

    const response = await fetchPets(page, s.appliedSearchTerm || undefined)
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
  const term = subject.getValue().searchTerm.trim()
  set({ appliedSearchTerm: term, currentPage: 0 })
  try {
    set({ loading: true, refreshing: false, error: null })
    const response = await fetchPets(0, term || undefined)
    set({
      pets: response.content || [],
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
      error: getErrorMessage(e, 'Erro ao buscar pets'),
    })
  } finally {
    set({ loading: false })
  }
}

async function clearSearch() {
  set({ searchTerm: '', appliedSearchTerm: '', currentPage: 0 })
  await loadPage(0, 'full')
}

async function goToPage(page: number) {
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
    void loadPage(subject.getValue().currentPage, 'soft')
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
      speciesFilter: '',
      ageMinText: '',
      ageMaxText: '',
      hasPhoto: false,
      hasTutor: false,
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
  setAgeMinText: (value: string) => set({ ageMinText: value }),
  setAgeMaxText: (value: string) => set({ ageMaxText: value }),
  setHasPhoto: (value: boolean) => set({ hasPhoto: value }),
  setHasTutor: (value: boolean) => set({ hasTutor: value }),
  clearFilters: () =>
    set({
      speciesFilter: '',
      ageMinText: '',
      ageMaxText: '',
      hasPhoto: false,
      hasTutor: false,
    }),
  search,
  clearSearch,
  goToPage,
  reload: () => loadPage(subject.getValue().currentPage, 'full'),
} as const

