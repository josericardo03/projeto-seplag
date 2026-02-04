import { BehaviorSubject } from 'rxjs'
import { authService } from '../services/authService'
import { clearTokens, getRefreshToken, isAccessValid, isRefreshValid, readTokens, TOKEN_STORAGE_KEYS } from '../services/tokenStorage'
import { petService } from '../services/petService'
import { tutorService } from '../services/tutorService'
import { getErrorMessage } from '../utils/errors'
import { AUTH_EVENTS } from '../utils/authEvents'

export type AuthState = {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initial: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

const subject = new BehaviorSubject<AuthState>(initial)

let initialized = false
let refreshTimerId: number | null = null
let silentRefreshPromise: Promise<void> | null = null

const REFRESH_SKEW_MS = 30_000

function clearRefreshTimer() {
  if (refreshTimerId !== null) window.clearTimeout(refreshTimerId)
  refreshTimerId = null
}

function scheduleProactiveRefresh() {
  clearRefreshTimer()
  const tokens = readTokens()
  if (!tokens) return
  if (!isRefreshValid()) return

  const now = Date.now()
  const refreshAt = Math.max(now, tokens.accessExpiresAt - REFRESH_SKEW_MS)
  const delay = refreshAt - now
  refreshTimerId = window.setTimeout(() => {
    void silentRefresh()
  }, delay)
}

function hardLogout(reasonMessage?: string) {
  authService.logout()
  petService.clearCache()
  tutorService.clearCache()
  clearRefreshTimer()
  set({ isAuthenticated: false, isLoading: false, error: reasonMessage || null })
}

function set(patch: Partial<AuthState>) {
  subject.next({ ...subject.getValue(), ...patch })
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = window.setTimeout(() => reject(new Error(message)), ms)
    promise
      .then((v) => resolve(v))
      .catch((e) => reject(e))
      .finally(() => window.clearTimeout(id))
  })
}

async function init() {
  const current = subject.getValue()
  if (initialized && current.isLoading === false) return
  initialized = true
  try {
    set({ isLoading: true, error: null })
    const tokens = readTokens()
    if (tokens && isAccessValid()) {
      set({ isAuthenticated: true, isLoading: false })
      scheduleProactiveRefresh()
      return
    }
    if (tokens && isRefreshValid()) {
      await refresh()
      return
    }
    clearTokens()
    set({ isAuthenticated: false, isLoading: false })
  } catch (e: unknown) {
    clearTokens()
    set({ isAuthenticated: false, isLoading: false, error: getErrorMessage(e, 'Erro ao autenticar') })
  }
}

async function login(username: string, password: string) {
  set({ isLoading: true, error: null })
  await authService.login({ username, password })
  set({ isAuthenticated: isAccessValid(), isLoading: false })
  scheduleProactiveRefresh()
}

function logout() {
  hardLogout()
}

async function refresh() {
  const refreshToken = getRefreshToken()
  if (!refreshToken || !isRefreshValid()) {
    clearTokens()
    set({ isAuthenticated: false, isLoading: false })
    return
  }
  set({ isLoading: true, error: null })
  try {
    await withTimeout(
      authService.refreshToken(refreshToken),
      5_000,
      'Tempo limite ao atualizar sessão. Faça login novamente.'
    )
    set({ isAuthenticated: isAccessValid(), isLoading: false })
    scheduleProactiveRefresh()
  } catch (e: unknown) {
    clearTokens()
    set({ isAuthenticated: false, isLoading: false, error: getErrorMessage(e, 'Erro ao atualizar sessão') })
  }
}

async function silentRefresh() {
  if (silentRefreshPromise) return silentRefreshPromise
  silentRefreshPromise = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken || !isRefreshValid()) {
      clearTokens()
      hardLogout()
      return
    }

    try {
      await withTimeout(authService.refreshToken(refreshToken), 5_000, 'Tempo limite ao atualizar sessão. Faça login novamente.')
      // Mantém a UI estável: não mexe em isLoading aqui.
      set({ isAuthenticated: isAccessValid(), error: null })
    } catch (e: unknown) {
      clearTokens()
      hardLogout(getErrorMessage(e, 'Sessão expirada. Faça login novamente.'))
    } finally {
      scheduleProactiveRefresh()
    }
  })().finally(() => {
    silentRefreshPromise = null
  })
  return silentRefreshPromise
}

function syncFromStorage() {
  const tokens = readTokens()
  if (!tokens) {
    set({ isAuthenticated: false, isLoading: false, error: null })
    clearRefreshTimer()
    return
  }
  if (isAccessValid()) {
    set({ isAuthenticated: true, isLoading: false, error: null })
    scheduleProactiveRefresh()
    return
  }
  if (isRefreshValid()) {
    void silentRefresh()
    return
  }
  clearTokens()
  set({ isAuthenticated: false, isLoading: false, error: null })
  clearRefreshTimer()
}

if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_EVENTS.LOGOUT, () => {
    // Disparado quando o refresh falha no interceptor
    syncFromStorage()
  })

  window.addEventListener('storage', (e) => {
    if (!e.key) return
    const keys = Object.values(TOKEN_STORAGE_KEYS)
    if (keys.includes(e.key as any)) {
      syncFromStorage()
    }
  })
}

export const authStore = {
  subject,
  init,
  login,
  logout,
  refresh,
} as {
  subject: BehaviorSubject<AuthState>
  init: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

