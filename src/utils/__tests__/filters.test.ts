import { describe, expect, it } from 'vitest'
import { applyPetFilters, applyTutorFilters, hasActivePetFilters, hasActiveTutorFilters } from '../filters'
import type { Pet, Tutor } from '../../types'

describe('filters', () => {
  it('applyPetFilters filtra por espécie, idade, foto e tutor', () => {
    const list: Pet[] = [
      { id: 1, nome: 'Rex', especie: 'Cachorro', idade: 3, foto: { id: 1, nome: 'x', contentType: 'x', url: 'x' }, tutores: [{ id: 1, nome: 'T' }] },
      { id: 2, nome: 'Mimi', especie: 'Gato', idade: 1, foto: null, tutores: [] },
      { id: 3, nome: 'Bob', especie: 'Cachorro', idade: 10, foto: { id: 2, nome: 'y', contentType: 'y', url: '' }, tutores: [{ id: 2, nome: 'U' }] },
    ]

    const res = applyPetFilters(list, {
      speciesFilter: 'cach',
      ageMinText: '2',
      ageMaxText: '9',
      hasPhoto: true,
      hasTutor: true,
    })

    expect(res.map((p) => p.id)).toEqual([1])
  })

  it('applyTutorFilters filtra por email/telefone/cpf/foto', () => {
    const list: Tutor[] = [
      { id: 1, nome: 'A', email: 'a@a.com', telefone: 'x', cpf: 1, foto: { id: 1, nome: 'x', contentType: 'x', url: 'x' } },
      { id: 2, nome: 'B', email: '', telefone: '', cpf: undefined, foto: null },
      { id: 3, nome: 'C', email: 'c@c.com', telefone: undefined, cpf: 2, foto: 'http://x' },
    ]

    const res = applyTutorFilters(list, { hasEmail: true, hasPhone: false, hasCpf: true, hasPhoto: true })
    expect(res.map((t) => t.id)).toEqual([1, 3])
  })

  it('hasActivePetFilters e hasActiveTutorFilters detectam filtros ativos', () => {
    expect(
      hasActivePetFilters({ speciesFilter: '', ageMinText: '', ageMaxText: '', hasPhoto: false, hasTutor: false })
    ).toBe(false)
    expect(hasActivePetFilters({ speciesFilter: 'Gato', ageMinText: '', ageMaxText: '', hasPhoto: false, hasTutor: false })).toBe(true)
    expect(hasActiveTutorFilters({ hasEmail: false, hasPhone: false, hasCpf: false, hasPhoto: false })).toBe(false)
    expect(hasActiveTutorFilters({ hasEmail: true, hasPhone: false, hasCpf: false, hasPhoto: false })).toBe(true)
  })
})

