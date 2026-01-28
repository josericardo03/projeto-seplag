import api from './api'
import type { LoginRequest, LoginResponse, RefreshTokenRequest } from '../types'
import { clearTokens, storeTokens } from './tokenStorage'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/autenticacao/login', credentials)
    storeTokens(response.data)
    return response.data
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await api.put<LoginResponse>(
        '/autenticacao/refresh',
        null,
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      )
      storeTokens(response.data)
      return response.data
    } catch {
      const response = await api.put<LoginResponse>(
        '/autenticacao/refresh',
        { refresh_token: refreshToken } as RefreshTokenRequest
      )
      storeTokens(response.data)
      return response.data
    }
  },

  logout(): void {
    clearTokens()
  },
}
