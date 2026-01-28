import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { authStore, type AuthState as AuthSnapshot } from '../state/authStore'
import { useBehaviorSubjectValue } from '../state/useBehaviorSubject'

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const snap = useBehaviorSubjectValue<AuthSnapshot>(authStore.subject)

  const login = useCallback((username: string, password: string) => authStore.login(username, password), [])
  const logout = useCallback(() => authStore.logout(), [])
  const refresh = useCallback(() => authStore.refresh(), [])

  useEffect(() => {
    void authStore.init()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: snap.isAuthenticated,
      isLoading: snap.isLoading,
      error: snap.error,
      login,
      logout,
      refresh,
    }),
    [snap.isAuthenticated, snap.isLoading, snap.error, login, logout, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthContext não encontrado')
  return ctx
}

