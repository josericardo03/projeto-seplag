import { useEffect, useState } from 'react'
import { authService } from '../services/authService'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔐 useAuth: Iniciando autenticação...')
    let isMounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔍 Verificando se já existe token...')
        if (authService.isAuthenticated()) {
          console.log('✅ Token encontrado no localStorage')
          if (isMounted) {
            setIsAuthenticated(true)
            setIsLoading(false)
            console.log('✅ Autenticação confirmada (token existente)')
          }
          return
        }

        console.log('❌ Token não encontrado, fazendo login automático...')
        try {
          console.log('📤 Enviando requisição de login...')
          const loginResponse = await authService.login({
            username: 'admin',
            password: 'admin',
          })
          
          console.log('✅ Login realizado com sucesso:', {
            hasAccessToken: !!loginResponse.access_token,
            hasRefreshToken: !!loginResponse.refresh_token,
          })
          
          if (isMounted) {
            setIsAuthenticated(true)
            setError(null)
            setIsLoading(false)
            console.log('✅ Estado de autenticação atualizado')
          }
        } catch (loginError: any) {
          console.error('❌ Erro no login:', loginError)
          console.error('📋 Detalhes do erro de login:', {
            message: loginError?.message,
            response: loginError?.response?.data,
            status: loginError?.response?.status,
            url: loginError?.config?.url,
          })
          
          const errorMessage = loginError?.response?.data?.message 
            || loginError?.message 
            || 'Erro ao fazer login'
          
          if (isMounted) {
            setError(errorMessage)
            setIsAuthenticated(false)
            setIsLoading(false)
            console.log('❌ Estado de erro atualizado')
          }
        }
      } catch (error: any) {
        console.error('❌ Erro geral na autenticação:', error)
        if (isMounted) {
          setError(error?.message || 'Erro desconhecido')
          setIsAuthenticated(false)
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      console.log('🧹 useAuth: Cleanup')
      isMounted = false
    }
  }, [])

  return { isAuthenticated, isLoading, error }
}
