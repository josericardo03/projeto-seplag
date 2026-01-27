import api from './api'
import type { Pet, PageableResponse } from '../types'

export interface PetListParams {
  page?: number
  size?: number
  nome?: string
}

export const petService = {
  async getPets(params: PetListParams = {}): Promise<PageableResponse<Pet>> {
    const { page = 0, size = 10, nome } = params
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })
    
    if (nome) {
      queryParams.append('nome', nome)
    }
    
    try {
      const response = await api.get<PageableResponse<Pet>>(
        `/v1/pets?${queryParams.toString()}`
      )
      
      if (!response.data) {
        throw new Error('Resposta da API está vazia')
      }
      
      const data = response.data
      
      const adaptedResponse: PageableResponse<Pet> = {
        content: data.content || [],
        totalElements: data.total ?? data.totalElements ?? 0,
        totalPages: data.pageCount ?? data.totalPages ?? 0,
        size: data.size ?? size,
        number: data.page ?? data.number ?? page,
        first: (data.page ?? page) === 0,
        last: (data.page ?? page) >= ((data.pageCount ?? data.totalPages ?? 1) - 1),
      }
      return adaptedResponse
    } catch (error: any) {
      throw error
    }
  },

  async getPetById(id: number): Promise<Pet> {
    const response = await api.get<Pet>(`/v1/pets/${id}`)
    return response.data
  },

  async createPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
    const response = await api.post<Pet>('/v1/pets', pet)
    return response.data
  },

  async updatePet(id: number, pet: Partial<Pet>): Promise<Pet> {
    const response = await api.put<Pet>(`/v1/pets/${id}`, pet)
    return response.data
  },

  async uploadPhoto(petId: number, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('foto', file)
    
    await api.post(`/v1/pets/${petId}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
