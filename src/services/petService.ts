import api from './api'
import type { Pet, PageableResponse } from '../types'
import { createAsyncCache } from './asyncCache'
import { adaptPageableResponse } from '../utils/pageable'

export interface PetListParams {
  page?: number
  size?: number
  nome?: string
}

const petByIdCache = createAsyncCache<number, Pet>({ ttlMs: 2 * 60_000 })

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
    
    const response = await api.get<PageableResponse<Pet>>(`/v1/pets?${queryParams.toString()}`)

    if (!response.data) {
      throw new Error('Resposta da API está vazia')
    }

    return adaptPageableResponse<Pet>(response.data, { page, size })
  },

  async getPetById(id: number): Promise<Pet> {
    return await petByIdCache.getOrLoad(id, async () => {
      const response = await api.get<Pet>(`/v1/pets/${id}`)
      return response.data
    })
  },

  async createPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
    const response = await api.post<Pet>('/v1/pets', pet)
    return response.data
  },

  async updatePet(id: number, pet: Partial<Pet>): Promise<Pet> {
    const response = await api.put<Pet>(`/v1/pets/${id}`, pet)
    petByIdCache.invalidate(id)
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
    petByIdCache.invalidate(petId)
  },

  async deletePhoto(petId: number, fotoId: number): Promise<void> {
    await api.delete(`/v1/pets/${petId}/fotos/${fotoId}`)
    petByIdCache.invalidate(petId)
  },

  async deletePet(id: number): Promise<void> {
    await api.delete(`/v1/pets/${id}`)
    petByIdCache.invalidate(id)
  },

  clearCache(): void {
    petByIdCache.clear()
  },
}
