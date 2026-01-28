import { useContext } from 'react'
import { AuthContext } from './authContextValue'

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthContext não encontrado')
  return ctx
}

