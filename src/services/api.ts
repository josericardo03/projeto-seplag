import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { authService } from './authService'
import { clearTokens, getAccessToken, getRefreshToken, isRefreshValid } from './tokenStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pet-manager-api.geia.vip'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  timeoutErrorMessage: 'Tempo limite excedido ao conectar na API',
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      // Não sobrescrever Authorization quando a chamada já define um token próprio
      // (ex.: refresh usa o refresh_token no header).
      const headers = config.headers
      const hasAuthorization =
        (headers instanceof AxiosHeaders && Boolean(headers.get('Authorization'))) ||
        (!(headers instanceof AxiosHeaders) &&
          Boolean(
            (headers as Record<string, unknown>)['Authorization'] ||
              (headers as Record<string, unknown>)['authorization']
          ))

      if (!hasAuthorization) {
        if (headers instanceof AxiosHeaders) {
          headers.set('Authorization', `Bearer ${token}`)
        } else {
          ;(headers as Record<string, unknown>)['Authorization'] = `Bearer ${token}`
        }
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let refreshPromise: Promise<string> | null = null

function isAuthEndpoint(url?: string) {
  if (!url) return false
  return url.includes('/autenticacao/login') || url.includes('/autenticacao/refresh')
}

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true

      const refreshToken = getRefreshToken()
      if (refreshToken && isRefreshValid()) {
        try {
          if (!refreshPromise) {
            refreshPromise = authService
              .refreshToken(refreshToken)
              .then((r) => r.access_token)
              .finally(() => {
                refreshPromise = null
              })
          }

          const access_token = await refreshPromise
          if (originalRequest.headers) {
            if (originalRequest.headers instanceof AxiosHeaders) {
              originalRequest.headers.set('Authorization', `Bearer ${access_token}`)
            } else {
              ;(originalRequest.headers as Record<string, unknown>)['Authorization'] = `Bearer ${access_token}`
            }
          }
          return api(originalRequest)
        } catch (refreshError) {
          clearTokens()
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
