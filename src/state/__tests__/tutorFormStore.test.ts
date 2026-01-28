import { describe, expect, it, vi } from 'vitest'
import { createTutorFormStore } from '../tutorFormStore'

vi.mock('../../services/tutorService', () => ({
  tutorService: {
    getTutorById: vi.fn(),
    getTutorPets: vi.fn(),
    deletePhoto: vi.fn(),
    updateTutor: vi.fn(),
    createTutor: vi.fn(),
    uploadPhoto: vi.fn(),
    linkPet: vi.fn(),
    unlinkPet: vi.fn(),
  },
}))

vi.mock('../../services/petService', () => ({
  petService: {
    getPetById: vi.fn(),
  },
}))

describe('tutorFormStore', () => {
  it('formata CPF e telefone ao alterar', () => {
    const store = createTutorFormStore()
    store.onChangeCpf('12345678901')
    store.onChangeTelefone('11912345678')
    const snap = store.subject.getValue()
    expect(snap.cpf).toBe('123.456.789-01')
    expect(snap.telefone).toBe('(11) 91234-5678')
  })
})

