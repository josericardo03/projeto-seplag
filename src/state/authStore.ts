import { BehaviorSubject } from 'rxjs'
import { authService } from '../services/authService'
import { clearTokens, getRefreshToken, isAccessValid, isRefreshValid, readTokens } from '../services/tokenStorage'

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

function set(patch: Partial<AuthState>) {
  subject.next({ ...subject.getValue(), ...patch })
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
      return
    }
    if (tokens && isRefreshValid()) {
      await refresh()
      return
    }
    clearTokens()
    set({ isAuthenticated: false, isLoading: false })
  } catch (e: any) {
    clearTokens()
    set({ isAuthenticated: false, isLoading: false, error: e?.message || 'Erro ao autenticar' })
  }
}

async function login(username: string, password: string) {
  set({ isLoading: true, error: null })
  await authService.login({ username, password })
  set({ isAuthenticated: isAccessValid(), isLoading: false })
}

function logout() {
  authService.logout()
  set({ isAuthenticated: false, isLoading: false, error: null })
}

async function refresh() {
  const refreshToken = getRefreshToken()
  if (!refreshToken || !isRefreshValid()) {
    clearTokens()
    set({ isAuthenticated: false, isLoading: false })
    return
  }
  set({ isLoading: true, error: null })
  await authService.refreshToken(refreshToken)
  set({ isAuthenticated: isAccessValid(), isLoading: false })
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

