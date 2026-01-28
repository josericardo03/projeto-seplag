import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo } from 'react'
import { authStore, type AuthState as AuthSnapshot } from '../state/authStore'
import { useBehaviorSubjectValue } from '../state/useBehaviorSubject'
import { AuthContext, type AuthContextValue } from './authContextValue'

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

