// Tipos para Pet
export interface Foto {
  id: number
  nome: string
  contentType: string
  url: string
}

export interface Pet {
  id: number
  nome: string
  especie?: string
  idade: number
  raca?: string
  foto?: Foto | null
  tutorId?: number
}

// Tipos para Tutor
export interface Tutor {
  id: number
  nome: string
  telefone?: string
  endereco?: string
  foto?: string
}

// Tipos para resposta paginada
export interface PageableResponse<T> {
  content: T[]
  totalElements?: number
  totalPages?: number
  total?: number
  pageCount?: number
  size?: number
  page?: number
  number?: number
  first?: boolean
  last?: boolean
}

// Tipos para autenticação
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
}

export interface RefreshTokenRequest {
  refresh_token: string
}
