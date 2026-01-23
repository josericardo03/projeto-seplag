import api from './api'
import type { LoginRequest, LoginResponse, RefreshTokenRequest } from '../types'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Fazendo requisição de login para:', '/autenticacao/login')
      const response = await api.post<LoginResponse>(
        '/autenticacao/login',
        credentials
      )
      
      console.log('Resposta do login recebida:', {
        hasAccessToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refresh_token,
      })
      
      // Salvar tokens no localStorage
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token)
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }
      
      return response.data
    } catch (error: any) {
      console.error('Erro no serviço de login:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      })
      throw error
    }
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await api.put<LoginResponse>(
      '/autenticacao/refresh',
      { refresh_token: refreshToken } as RefreshTokenRequest
    )
    
    // Atualizar tokens no localStorage
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('refresh_token', response.data.refresh_token)
    
    return response.data
  },

  logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  },
}
