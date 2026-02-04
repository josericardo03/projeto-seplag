import type { Pet } from '../types'
import { BehaviorSubject } from 'rxjs'
import { petService } from '../services/petService'
import { getErrorMessage } from '../utils/errors'

type Mode = 'create' | 'edit'

type PetFormState = {
  mode: Mode
  petId: number | null
  initialLoading: boolean
  saving: boolean
  error: string | null
  success: string | null
  fieldErrors: Record<string, string>

  nome: string
  especie: string
  idadeText: string
  raca: string

  existingPhotoUrl: string | null
  photoFile: File | null
}

function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, '')
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function idadeNumberFromText(text: string) {
  const raw = onlyDigits(text)
  if (!raw) return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  return clamp(n, 0, 80)
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = window.setTimeout(() => reject(new Error(message)), ms)
    promise
      .then((v) => resolve(v))
      .catch((e) => reject(e))
      .finally(() => window.clearTimeout(id))
  })
}

export function createPetFormStore() {
  const subject = new BehaviorSubject<PetFormState>({
    mode: 'create',
    petId: null,
    initialLoading: false,
    saving: false,
    error: null,
    success: null,
    fieldErrors: {},
    nome: '',
    especie: '',
    idadeText: '',
    raca: '',
    existingPhotoUrl: null,
    photoFile: null,
  })

  function set(patch: Partial<PetFormState>) {
    subject.next({ ...subject.getValue(), ...patch })
  }

  function reset(mode: Mode, petId: number | null, initialLoading = false) {
    set({
      mode,
      petId,
      initialLoading,
      saving: false,
      error: null,
      success: null,
      fieldErrors: {},
      nome: '',
      especie: '',
      idadeText: '',
      raca: '',
      existingPhotoUrl: null,
      photoFile: null,
    })
  }

  async function loadPet(petId: number) {
    try {
      set({ initialLoading: true, error: null })
      const pet = await withTimeout(
        petService.getPetById(petId),
        12000,
        'Demorando para carregar o pet. Verifique sua conexão e tente novamente.'
      )
      set({
        nome: pet.nome || '',
        especie: pet.especie || '',
        idadeText: String(pet.idade ?? ''),
        raca: pet.raca || '',
        existingPhotoUrl: pet.foto?.url || null,
      })
    } catch (e: unknown) {
      set({ error: getErrorMessage(e, 'Erro ao carregar pet') })
    } finally {
      set({ initialLoading: false })
    }
  }

  function validate() {
    const s = subject.getValue()
    const errs: Record<string, string> = {}
    if (!s.nome.trim()) errs.nome = 'Informe o nome'
    if (idadeNumberFromText(s.idadeText) === null) errs.idade = 'Informe a idade (apenas números)'
    set({ fieldErrors: errs })
    return Object.keys(errs).length === 0
  }

  function onChangeIdade(value: string) {
    const raw = onlyDigits(value)
    if (!raw) {
      set({ idadeText: '' })
      return
    }
    const n = clamp(Number(raw), 0, 80)
    set({ idadeText: String(n) })
  }

  async function submit(navigateTo: (path: string) => void) {
    set({ success: null, error: null })
    if (!validate()) return
    const s = subject.getValue()
    const idadeNumber = idadeNumberFromText(s.idadeText)
    if (idadeNumber === null) return

    try {
      set({ saving: true })
      const payload: Omit<Pet, 'id'> = {
        nome: s.nome.trim(),
        idade: idadeNumber,
      }
      const especieTrim = s.especie.trim()
      const racaTrim = s.raca.trim()
      if (especieTrim) payload.especie = especieTrim
      if (racaTrim) payload.raca = racaTrim

      let saved: Pet
      if (s.mode === 'edit' && s.petId) {
        saved = await petService.updatePet(s.petId, payload)
      } else {
        saved = await petService.createPet(payload)
      }

      if (s.photoFile) {
        await petService.uploadPhoto(saved.id, s.photoFile)
      }

      set({ success: s.mode === 'edit' ? 'Pet atualizado com sucesso' : 'Pet cadastrado com sucesso' })
      window.setTimeout(() => navigateTo(`/pets/${saved.id}`), 500)
    } catch (e: unknown) {
      set({ error: getErrorMessage(e, 'Erro ao salvar pet') })
    } finally {
      set({ saving: false })
    }
  }

  return {
    subject,
    reset,
    loadPet,
    setNome: (value: string) => set({ nome: value }),
    setEspecie: (value: string) => set({ especie: value }),
    setRaca: (value: string) => set({ raca: value }),
    onChangeIdade,
    onPickPhoto: (file: File | null) => set({ photoFile: file }),
    submit,
  } as const
}

