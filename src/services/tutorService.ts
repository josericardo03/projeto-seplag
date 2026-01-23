import api from './api'
import type { Tutor } from '../types'

export const tutorService = {
  async getTutorById(id: number): Promise<Tutor> {
    const response = await api.get<Tutor>(`/v1/tutores/${id}`)
    return response.data
  },
}
