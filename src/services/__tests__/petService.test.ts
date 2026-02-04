import { describe, expect, it, vi } from 'vitest'
import { petService } from '../petService'

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
  get: { mockResolvedValueOnce: (value: unknown) => void; mock: { calls: unknown[][] } }
  post: { mockResolvedValueOnce: (value: unknown) => void }
  put: { mockResolvedValueOnce: (value: unknown) => void }
  delete: { mockResolvedValueOnce: (value: unknown) => void }
}

describe('petService', () => {
  it('getPets monta querystring com page/size/nome', async () => {
    ;(api as unknown as ApiMock).get.mockResolvedValueOnce({
      data: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 },
    })

    await petService.getPets({ page: 2, size: 25, nome: 'Rex' })

    expect(api.get).toHaveBeenCalledTimes(1)
    const url = ((api as unknown as ApiMock).get.mock.calls[0]?.[0] as string) || ''
    expect(url).toContain('/v1/pets?')
    expect(url).toContain('page=2')
    expect(url).toContain('size=25')
    expect(url).toContain('nome=Rex')
  })

  it('createPet faz POST em /v1/pets', async () => {
    ;(api as unknown as ApiMock).post.mockResolvedValueOnce({ data: { id: 1, nome: 'Rex', idade: 3 } })
    const res = await petService.createPet({ nome: 'Rex', idade: 3 })
    expect(api.post).toHaveBeenCalledWith('/v1/pets', { nome: 'Rex', idade: 3 })
    expect(res.id).toBe(1)
  })

  it('updatePet faz PUT em /v1/pets/:id', async () => {
    ;(api as unknown as ApiMock).put.mockResolvedValueOnce({ data: { id: 10, nome: 'Rex', idade: 4 } })
    const res = await petService.updatePet(10, { idade: 4 })
    expect(api.put).toHaveBeenCalledWith('/v1/pets/10', { idade: 4 })
    expect(res.id).toBe(10)
  })

  it('deletePet faz DELETE em /v1/pets/:id', async () => {
    ;(api as unknown as ApiMock).delete.mockResolvedValueOnce({ data: {} })
    await petService.deletePet(99)
    expect(api.delete).toHaveBeenCalledWith('/v1/pets/99')
  })
})

