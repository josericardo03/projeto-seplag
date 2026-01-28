import axios from 'axios'
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
  (config) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
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
    const originalRequest = error.config

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
            originalRequest.headers.Authorization = `Bearer ${access_token}`
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
