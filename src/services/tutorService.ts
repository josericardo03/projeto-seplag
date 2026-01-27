import api from './api'
import type { Pet, Tutor } from '../types'
import type { PageableResponse } from '../types'

export interface TutorListParams {
  page?: number
  size?: number
  nome?: string
}

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
    const data = response.data as any

    const adapted: PageableResponse<Tutor> = {
      content: data.content || [],
      totalElements: data.total ?? data.totalElements ?? 0,
      totalPages: data.pageCount ?? data.totalPages ?? 0,
      size: data.size ?? size,
      number: data.page ?? data.number ?? page,
      first: (data.page ?? page) === 0,
      last: (data.page ?? page) >= ((data.pageCount ?? data.totalPages ?? 1) - 1),
    }

    return adapted
  },

  async createTutor(payload: Omit<Tutor, 'id'>): Promise<Tutor> {
    const response = await api.post<Tutor>('/v1/tutores', payload)
    return response.data
  },

  async updateTutor(id: number, payload: Partial<Omit<Tutor, 'id'>>): Promise<Tutor> {
    const response = await api.put<Tutor>(`/v1/tutores/${id}`, payload)
    return response.data
  },

  async getTutorById(id: number): Promise<Tutor> {
    const response = await api.get<Tutor>(`/v1/tutores/${id}`)
    return response.data
  },

  async uploadPhoto(tutorId: number, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('foto', file)

    await api.post(`/v1/tutores/${tutorId}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async deletePhoto(tutorId: number, fotoId: number): Promise<void> {
    await api.delete(`/v1/tutores/${tutorId}/fotos/${fotoId}`)
  },

  async getTutorPets(tutorId: number): Promise<Pet[]> {
    const response = await api.get<any>(`/v1/tutores/${tutorId}/pets`)
    const data = response.data
    if (!data) return []
    if (Array.isArray(data)) return data as Pet[]
    if (Array.isArray(data.content)) return data.content as Pet[]
    return []
  },

  async linkPet(tutorId: number, petId: number): Promise<void> {
    await api.post(`/v1/tutores/${tutorId}/pets/${petId}`)
  },

  async unlinkPet(tutorId: number, petId: number): Promise<void> {
    await api.delete(`/v1/tutores/${tutorId}/pets/${petId}`)
  },
}
