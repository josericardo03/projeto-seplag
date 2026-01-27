import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { clearTokens, getRefreshToken, isAccessValid, isRefreshValid, readTokens } from '../services/tokenStorage'

type AuthState = {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const syncFromStorage = useCallback(() => {
    const ok = isAccessValid()
    setIsAuthenticated(ok)
  }, [])

  const refresh = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken || !isRefreshValid()) {
      clearTokens()
      setIsAuthenticated(false)
      return
    }
    await authService.refreshToken(refreshToken)
    syncFromStorage()
  }, [syncFromStorage])

  const login = useCallback(
    async (username: string, password: string) => {
      setError(null)
      await authService.login({ username, password })
      syncFromStorage()
    },
    [syncFromStorage]
  )

  const logout = useCallback(() => {
    authService.logout()
    setIsAuthenticated(false)
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const tokens = readTokens()
        if (tokens && isAccessValid()) {
          setIsAuthenticated(true)
          return
        }
        if (tokens && isRefreshValid()) {
          await refresh()
          return
        }
        clearTokens()
        setIsAuthenticated(false)
      } catch (e: any) {
        clearTokens()
        setIsAuthenticated(false)
        setError(e?.message || 'Erro ao autenticar')
      } finally {
        setIsLoading(false)
      }
    }
    void init()
  }, [refresh])

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
      refresh,
    }),
    [isAuthenticated, isLoading, error, login, logout, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthContext não encontrado')
  return ctx
}

