import { BehaviorSubject } from 'rxjs'
import type { PageableResponse, Tutor } from '../types'
import { tutorService, type TutorListParams } from '../services/tutorService'
import { authStore } from './authStore'

type Mode = 'full' | 'soft'

export type TutoresListState = {
  tutores: Tutor[]
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

const initial: TutoresListState = {
  tutores: [],
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

const subject = new BehaviorSubject<TutoresListState>(initial)

let mountedCount = 0
let pollId: number | null = null
let lastAuth = authStore.subject.getValue()

function set(patch: Partial<TutoresListState>) {
  subject.next({ ...subject.getValue(), ...patch })
}

function isAuthedReady() {
  const a = authStore.subject.getValue()
  return !!a.isAuthenticated && !a.isLoading
}

async function fetchTutores(page: number, nome?: string) {
  const s = subject.getValue()
  const params: TutorListParams = {
    page,
    size: s.pageSize,
    ...(nome && nome.trim() && { nome: nome.trim() }),
  }
  const response: PageableResponse<Tutor> = await tutorService.getTutores(params)
  return response
}

async function loadPage(page: number, mode: Mode = 'full') {
  const s = subject.getValue()
  const hasData = s.tutores.length > 0
  const soft = mode === 'soft' && hasData

  try {
    set({ error: null })
    if (soft) set({ refreshing: true })
    else set({ loading: true })

    const response = await fetchTutores(page, s.appliedSearchTerm || undefined)
    set({
      tutores: response.content || [],
      totalPages: response.totalPages || 0,
      totalElements: response.totalElements || 0,
      currentPage: response.number || 0,
    })
  } catch (e: any) {
    set({
      tutores: [],
      totalPages: 0,
      totalElements: 0,
      currentPage: 0,
      error: e?.response?.data?.message || e?.message || 'Erro ao carregar tutores',
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
    const response = await fetchTutores(0, term || undefined)
    set({
      tutores: response.content || [],
      totalPages: response.totalPages || 0,
      totalElements: response.totalElements || 0,
      currentPage: response.number || 0,
    })
  } catch (e: any) {
    set({
      tutores: [],
      totalPages: 0,
      totalElements: 0,
      currentPage: 0,
      error: e?.response?.data?.message || e?.message || 'Erro ao buscar tutores',
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
  const patch: Partial<TutoresListState> = {}
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
      tutores: [],
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

export const tutoresListStore = {
  subject,
  configure,
  mount,
  setSearchTerm: (value: string) => set({ searchTerm: value }),
  search,
  clearSearch,
  goToPage,
  reload: () => loadPage(subject.getValue().currentPage, 'full'),
} as const

