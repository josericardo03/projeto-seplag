import { createContext } from 'react'

export type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

