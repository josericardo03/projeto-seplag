import axios from 'axios'

const API_BASE_URL = 'https://pet-manager-api.geia.vip'

// Cria instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token Bearer nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    console.log('🔧 Interceptor de requisição executado:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
    })
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Token Bearer adicionado à requisição:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        tokenLength: token.length,
        headerSet: !!config.headers.Authorization,
      })
    } else {
      console.warn('⚠️ Token não encontrado para requisição:', {
        url: config.url,
        localStorageKeys: Object.keys(localStorage),
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ Erro no interceptor de requisição:', error)
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    // Log para debug (apenas em desenvolvimento)
    if (import.meta.env.DEV) {
      console.log('Resposta recebida:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log de erro
    console.error('Erro na resposta da API:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    })

    // Evitar loop infinito de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Token expirado - tentar refresh
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          console.log('Tentando refresh token...')
          // Usar axios direto para evitar interceptors
          const response = await axios.put(
            `${API_BASE_URL}/autenticacao/refresh`,
            { refresh_token: refreshToken }
          )
          const { access_token, refresh_token: newRefreshToken } = response.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', newRefreshToken)

          console.log('Token renovado com sucesso')

          // Repetir requisição original com novo token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`
          }
          return api(originalRequest)
        } catch (refreshError) {
          console.error('Erro ao renovar token:', refreshError)
          // Refresh falhou - limpar tokens e redirecionar para login
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          // Não redirecionar automaticamente, deixar o componente tratar
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
