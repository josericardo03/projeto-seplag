import axios from 'axios'
import { authService } from './authService'
import { clearTokens, getAccessToken, getRefreshToken, isRefreshValid } from './tokenStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pet-manager-api.geia.vip'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = getRefreshToken()
      if (refreshToken && isRefreshValid()) {
        try {
          const response = await authService.refreshToken(refreshToken)
          const { access_token } = response
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
