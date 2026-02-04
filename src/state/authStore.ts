import { BehaviorSubject } from 'rxjs'
import { authService } from '../services/authService'
import { clearTokens, getRefreshToken, isAccessValid, isRefreshValid, readTokens } from '../services/tokenStorage'
import { petService } from '../services/petService'
import { tutorService } from '../services/tutorService'
import { getErrorMessage } from '../utils/errors'

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
}

function logout() {
  authService.logout()
  // Evita “vazar” dados em memória entre sessões/usuários
  petService.clearCache()
  tutorService.clearCache()
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
  try {
    await withTimeout(
      authService.refreshToken(refreshToken),
      5_000,
      'Tempo limite ao atualizar sessão. Faça login novamente.'
    )
    set({ isAuthenticated: isAccessValid(), isLoading: false })
  } catch (e: unknown) {
    clearTokens()
    set({ isAuthenticated: false, isLoading: false, error: getErrorMessage(e, 'Erro ao atualizar sessão') })
  }
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

