import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createPetFormStore } from '../petFormStore'

const mockPetService = {
  getPetById: vi.fn(),
  createPet: vi.fn(),
  updatePet: vi.fn(),
  uploadPhoto: vi.fn(),
  deletePhoto: vi.fn(),
}

vi.mock('../../services/petService', () => ({
  petService: mockPetService,
}))

describe('petFormStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('removeExistingPhoto chama deletePhoto e limpa estado', async () => {
    mockPetService.getPetById.mockResolvedValueOnce({
      id: 10,
      nome: 'Rex',
      idade: 3,
      foto: { id: 77, nome: 'x', contentType: 'image/png', url: 'http://img' },
    })
    mockPetService.deletePhoto.mockResolvedValueOnce(undefined)

    const store = createPetFormStore()
    store.reset('edit', 10, true)
    await store.loadPet(10)

    await store.removeExistingPhoto()

    expect(mockPetService.deletePhoto).toHaveBeenCalledWith(10, 77)
    const snap = store.subject.getValue()
    expect(snap.existingPhotoId).toBe(null)
    expect(snap.existingPhotoUrl).toBe(null)
    expect(snap.success).toContain('Foto removida')
  })

  it('submit com foto chama uploadPhoto depois de criar pet', async () => {
    mockPetService.createPet.mockResolvedValueOnce({ id: 123, nome: 'Rex', idade: 3 })
    mockPetService.uploadPhoto.mockResolvedValueOnce(undefined)

    const file = new File(['x'], 'foto.png', { type: 'image/png' })

    const store = createPetFormStore()
    store.reset('create', null, false)
    store.setNome('Rex')
    store.onChangeIdade('3')
    store.onPickPhoto(file)

    await store.submit(() => {})

    expect(mockPetService.createPet).toHaveBeenCalled()
    expect(mockPetService.uploadPhoto).toHaveBeenCalledWith(123, file)
  })
})

