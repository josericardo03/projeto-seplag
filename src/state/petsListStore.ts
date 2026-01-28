import { BehaviorSubject } from 'rxjs'
import { petService, type PetListParams } from '../services/petService'
import type { PageableResponse, Pet } from '../types'
import { authStore } from './authStore'

type Mode = 'full' | 'soft'

export type PetsListState = {
  pets: Pet[]
  loading: boolean
  refreshing: boolean
  error: string | null

  searchTerm: string
  appliedSearchTerm: string

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
  } catch (e: any) {
    set({
      pets: [],
      totalPages: 0,
      totalElements: 0,
      currentPage: 0,
      error: e?.response?.data?.message || e?.message || 'Erro ao carregar pets',
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
  } catch (e: any) {
    set({
      pets: [],
      totalPages: 0,
      totalElements: 0,
      currentPage: 0,
      error: e?.response?.data?.message || e?.message || 'Erro ao buscar pets',
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
  search,
  clearSearch,
  goToPage,
  reload: () => loadPage(subject.getValue().currentPage, 'full'),
} as const

