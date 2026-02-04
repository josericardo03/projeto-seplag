import { describe, expect, it, vi } from 'vitest'
import { tutorService } from '../tutorService'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '../api'

type ApiMock = {
  get: { mockResolvedValueOnce: (value: unknown) => void }
  post: { mockResolvedValueOnce: (value: unknown) => void }
  put: { mockResolvedValueOnce: (value: unknown) => void }
  delete: { mockResolvedValueOnce: (value: unknown) => void }
}

describe('tutorService', () => {
  it('getTutores adapta paginação quando API retorna total/pageCount', async () => {
    ;(api as unknown as ApiMock).get.mockResolvedValueOnce({
      data: { content: [{ id: 1, nome: 'João' }], total: 1, pageCount: 1, page: 0, size: 10 },
    })
    const res = await tutorService.getTutores({ page: 0, size: 10 })
    expect(res.content).toHaveLength(1)
    expect(res.totalElements).toBe(1)
    expect(res.totalPages).toBe(1)
  })

  it('getTutorPets aceita array direto', async () => {
    ;(api as unknown as ApiMock).get.mockResolvedValueOnce({ data: [{ id: 10, nome: 'Rex', idade: 3 }] })
    const pets = await tutorService.getTutorPets(5)
    expect(pets).toHaveLength(1)
    expect(pets[0].id).toBe(10)
  })

  it('getTutorPets aceita { content: [] }', async () => {
    ;(api as unknown as ApiMock).get.mockResolvedValueOnce({ data: { content: [{ id: 11, nome: 'Mel', idade: 2 }] } })
    const pets = await tutorService.getTutorPets(5)
    expect(pets).toHaveLength(1)
    expect(pets[0].id).toBe(11)
  })

  it('linkPet e unlinkPet usam rotas corretas', async () => {
    ;(api as unknown as ApiMock).post.mockResolvedValueOnce({ data: {} })
    ;(api as unknown as ApiMock).delete.mockResolvedValueOnce({ data: {} })
    await tutorService.linkPet(1, 2)
    await tutorService.unlinkPet(1, 2)
    expect(api.post).toHaveBeenCalledWith('/v1/tutores/1/pets/2')
    expect(api.delete).toHaveBeenCalledWith('/v1/tutores/1/pets/2')
  })

  it('deleteTutor faz DELETE em /v1/tutores/:id', async () => {
    ;(api as unknown as ApiMock).delete.mockResolvedValueOnce({ data: {} })
    await tutorService.deleteTutor(123)
    expect(api.delete).toHaveBeenCalledWith('/v1/tutores/123')
  })
})

