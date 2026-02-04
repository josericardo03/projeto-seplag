import api from './api'
import type { Pet, Tutor } from '../types'
import type { PageableResponse } from '../types'
import { createAsyncCache } from './asyncCache'
import { adaptPageableResponse } from '../utils/pageable'

export interface TutorListParams {
  page?: number
  size?: number
  nome?: string
}

const tutorByIdCache = createAsyncCache<number, Tutor>({ ttlMs: 2 * 60_000 })

export const tutorService = {
  async getTutores(params: TutorListParams = {}): Promise<PageableResponse<Tutor>> {
    const { page = 0, size = 10, nome } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    if (nome) queryParams.append('nome', nome)

    const response = await api.get<PageableResponse<Tutor>>(`/v1/tutores?${queryParams.toString()}`)

    if (!response.data) throw new Error('Resposta da API está vazia')
    return adaptPageableResponse<Tutor>(response.data, { page, size })
  },

  async createTutor(payload: Omit<Tutor, 'id'>): Promise<Tutor> {
    const response = await api.post<Tutor>('/v1/tutores', payload)
    return response.data
  },

  async updateTutor(id: number, payload: Partial<Omit<Tutor, 'id'>>): Promise<Tutor> {
    const response = await api.put<Tutor>(`/v1/tutores/${id}`, payload)
    tutorByIdCache.invalidate(id)
    return response.data
  },

  async getTutorById(id: number): Promise<Tutor> {
    return await tutorByIdCache.getOrLoad(id, async () => {
      const response = await api.get<Tutor>(`/v1/tutores/${id}`)
      return response.data
    })
  },

  async uploadPhoto(tutorId: number, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('foto', file)

    await api.post(`/v1/tutores/${tutorId}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    tutorByIdCache.invalidate(tutorId)
  },

  async deletePhoto(tutorId: number, fotoId: number): Promise<void> {
    await api.delete(`/v1/tutores/${tutorId}/fotos/${fotoId}`)
    tutorByIdCache.invalidate(tutorId)
  },

  async getTutorPets(tutorId: number): Promise<Pet[]> {
    const response = await api.get<unknown>(`/v1/tutores/${tutorId}/pets`)
    const data = response.data
    if (!data) return []
    if (Array.isArray(data)) return data as unknown as Pet[]
    if (typeof data === 'object' && data !== null && Array.isArray((data as { content?: unknown }).content)) {
      return (data as { content: unknown[] }).content as unknown as Pet[]
    }
    return []
  },

  async linkPet(tutorId: number, petId: number): Promise<void> {
    await api.post(`/v1/tutores/${tutorId}/pets/${petId}`)
  },

  async unlinkPet(tutorId: number, petId: number): Promise<void> {
    await api.delete(`/v1/tutores/${tutorId}/pets/${petId}`)
  },

  async deleteTutor(id: number): Promise<void> {
    await api.delete(`/v1/tutores/${id}`)
    tutorByIdCache.invalidate(id)
  },

  clearCache(): void {
    tutorByIdCache.clear()
  },
}
