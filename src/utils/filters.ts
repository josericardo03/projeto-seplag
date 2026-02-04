import type { Pet, Tutor } from '../types'

function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, '')
}

function parseNumberText(value: string): number | null {
  const raw = onlyDigits(value).trim()
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

export type PetFilters = {
  speciesFilter: string
  ageMinText: string
  ageMaxText: string
  hasPhoto: boolean
  hasTutor: boolean
}

export function applyPetFilters(list: Pet[], filters: PetFilters): Pet[] {
  const species = normalizeText(filters.speciesFilter)
  const minAge = parseNumberText(filters.ageMinText)
  const maxAge = parseNumberText(filters.ageMaxText)

  return list.filter((pet) => {
    if (species) {
      const s = normalizeText(pet.especie || '')
      if (!s.includes(species)) return false
    }

    if (minAge !== null) {
      if (!Number.isFinite(pet.idade)) return false
      if (pet.idade < minAge) return false
    }

    if (maxAge !== null) {
      if (!Number.isFinite(pet.idade)) return false
      if (pet.idade > maxAge) return false
    }

    if (filters.hasPhoto) {
      const has = !!pet.foto?.url
      if (!has) return false
    }

    if (filters.hasTutor) {
      const has = (pet.tutores?.length ?? 0) > 0 || typeof pet.tutorId === 'number'
      if (!has) return false
    }

    return true
  })
}

export type TutorFilters = {
  hasEmail: boolean
  hasPhone: boolean
  hasCpf: boolean
  hasPhoto: boolean
}

function tutorHasPhoto(tutor: Tutor) {
  const foto = tutor.foto
  if (!foto) return false
  if (typeof foto === 'string') return foto.trim().length > 0
  if (typeof foto === 'object' && typeof foto.url === 'string') return foto.url.trim().length > 0
  return false
}

export function applyTutorFilters(list: Tutor[], filters: TutorFilters): Tutor[] {
  return list.filter((t) => {
    if (filters.hasEmail && !t.email) return false
    if (filters.hasPhone && !t.telefone) return false
    if (filters.hasCpf && !t.cpf) return false
    if (filters.hasPhoto && !tutorHasPhoto(t)) return false
    return true
  })
}

export function hasActivePetFilters(filters: PetFilters) {
  return (
    !!filters.speciesFilter.trim() ||
    !!filters.ageMinText.trim() ||
    !!filters.ageMaxText.trim() ||
    !!filters.hasPhoto ||
    !!filters.hasTutor
  )
}

export function hasActiveTutorFilters(filters: TutorFilters) {
  return !!filters.hasEmail || !!filters.hasPhone || !!filters.hasCpf || !!filters.hasPhoto
}

