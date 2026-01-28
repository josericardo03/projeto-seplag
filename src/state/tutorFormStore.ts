import { BehaviorSubject } from 'rxjs'
import type { Pet, Tutor } from '../types'
import { tutorService } from '../services/tutorService'
import { petService } from '../services/petService'

type Mode = 'create' | 'edit'

export type TutorFormState = {
  mode: Mode
  tutorId: number | null
  initialLoading: boolean
  saving: boolean
  linking: boolean
  removingPhoto: boolean
  error: string | null
  success: string | null
  fieldErrors: Record<string, string>

  nome: string
  email: string
  telefone: string
  endereco: string
  cpf: string

  existingPhotoUrl: string | null
  existingPhotoId: number | null
  photoFile: File | null

  pets: Pet[]
  petsLoading: boolean
  petIdText: string
}

function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, '')
}

function formatPhoneBR(digits: string) {
  const d = onlyDigits(digits).slice(0, 11)
  if (d.length <= 2) return d
  const ddd = d.slice(0, 2)
  const rest = d.slice(2)
  if (rest.length <= 4) return `(${ddd}) ${rest}`
  if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
}

function formatCpfBR(value: string) {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function coerceTutorPhoto(tutor: Tutor | any): { id: number | null; url: string | null } {
  if (!tutor) return { id: null, url: null }
  if (typeof tutor.foto === 'string') return { id: null, url: tutor.foto }
  if (tutor.foto?.url) return { id: Number(tutor.foto.id) || null, url: tutor.foto.url }
  return { id: null, url: null }
}

export function createTutorFormStore() {
  const subject = new BehaviorSubject<TutorFormState>({
    mode: 'create',
    tutorId: null,
    initialLoading: false,
    saving: false,
    linking: false,
    removingPhoto: false,
    error: null,
    success: null,
    fieldErrors: {},
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cpf: '',
    existingPhotoUrl: null,
    existingPhotoId: null,
    photoFile: null,
    pets: [],
    petsLoading: false,
    petIdText: '',
  })

  let alive = true

  function set(patch: Partial<TutorFormState>) {
    if (!alive) return
    subject.next({ ...subject.getValue(), ...patch })
  }

  function reset(mode: Mode, tutorId: number | null) {
    set({
      mode,
      tutorId,
      initialLoading: mode === 'edit',
      saving: false,
      linking: false,
      removingPhoto: false,
      error: null,
      success: null,
      fieldErrors: {},
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      cpf: '',
      existingPhotoUrl: null,
      existingPhotoId: null,
      photoFile: null,
      pets: [],
      petsLoading: false,
      petIdText: '',
    })
  }

  function validate() {
    const s = subject.getValue()
    const errs: Record<string, string> = {}
    if (!s.nome.trim()) errs.nome = 'Informe o nome completo'
    if (!s.email.trim()) errs.email = 'Informe o email'
    const cpfDigits = onlyDigits(s.cpf)
    if (!cpfDigits) errs.cpf = 'Informe o CPF'
    else if (cpfDigits.length !== 11) errs.cpf = 'CPF inválido'
    const digits = onlyDigits(s.telefone)
    if (digits && digits.length < 10) errs.telefone = 'Telefone inválido'
    set({ fieldErrors: errs })
    return Object.keys(errs).length === 0
  }

  async function loadPets(tutorId: number) {
    try {
      set({ petsLoading: true })
      const list = await tutorService.getTutorPets(tutorId)
      set({ pets: list || [] })
    } catch {
    } finally {
      set({ petsLoading: false })
    }
  }

  async function refreshPets(tutorId: number) {
    try {
      await loadPets(tutorId)
      return
    } catch {
    }
    try {
      const tutor = await tutorService.getTutorById(tutorId)
      const petsFromTutor =
        (tutor as any).pets ||
        (tutor as any).petsVinculados ||
        (tutor as any).animais ||
        null
      if (Array.isArray(petsFromTutor)) set({ pets: petsFromTutor })
    } catch {
    }
  }

  async function loadTutor(tutorId: number) {
    try {
      set({ initialLoading: true, error: null })
      const tutor = await tutorService.getTutorById(tutorId)
      const photo = coerceTutorPhoto(tutor)

      set({
        nome: tutor.nome || '',
        email: tutor.email || '',
        telefone: tutor.telefone ? formatPhoneBR(tutor.telefone) : '',
        endereco: tutor.endereco || '',
        cpf: tutor.cpf ? formatCpfBR(String(tutor.cpf)) : '',
        existingPhotoUrl: photo.url,
        existingPhotoId: photo.id,
      })

      const petsFromTutor =
        (tutor as any).pets ||
        (tutor as any).petsVinculados ||
        (tutor as any).animais ||
        null

      if (Array.isArray(petsFromTutor)) set({ pets: petsFromTutor })
      else await refreshPets(tutorId)
    } catch (e: any) {
      set({ error: e?.response?.data?.message || e?.message || 'Erro ao carregar tutor' })
    } finally {
      set({ initialLoading: false })
    }
  }

  async function removeExistingPhoto() {
    const s = subject.getValue()
    if (!s.tutorId || !s.existingPhotoId) return
    try {
      set({ removingPhoto: true, error: null })
      await tutorService.deletePhoto(s.tutorId, s.existingPhotoId)
      set({
        existingPhotoId: null,
        existingPhotoUrl: null,
        success: 'Foto removida com sucesso',
      })
    } catch (e: any) {
      set({ error: e?.response?.data?.message || e?.message || 'Erro ao remover foto' })
    } finally {
      set({ removingPhoto: false })
    }
  }

  async function submit(navigateTo: (path: string) => void) {
    set({ success: null, error: null })
    if (!validate()) return
    const s = subject.getValue()

    const payload: Omit<Tutor, 'id'> = {
      nome: s.nome.trim(),
      email: s.email.trim(),
      cpf: Number(onlyDigits(s.cpf)),
    }
    if (s.telefone.trim()) payload.telefone = s.telefone.trim()
    if (s.endereco.trim()) payload.endereco = s.endereco.trim()

    try {
      set({ saving: true })
      let saved: Tutor
      if (s.mode === 'edit' && s.tutorId) {
        saved = await tutorService.updateTutor(s.tutorId, payload)
      } else {
        saved = await tutorService.createTutor(payload)
      }

      if (s.photoFile) {
        await tutorService.uploadPhoto(saved.id, s.photoFile)
      }

      set({ success: s.mode === 'edit' ? 'Tutor atualizado com sucesso' : 'Tutor cadastrado com sucesso' })
      window.setTimeout(() => navigateTo(`/tutores/${saved.id}/editar`), 500)
    } catch (e: any) {
      set({ error: e?.response?.data?.message || e?.message || 'Erro ao salvar tutor' })
    } finally {
      set({ saving: false })
    }
  }

  async function linkPet() {
    const s = subject.getValue()
    if (!s.tutorId) return
    const raw = onlyDigits(s.petIdText)
    if (!raw) {
      set({ fieldErrors: { ...s.fieldErrors, petId: 'Informe o ID do pet' } })
      return
    }
    const petId = Number(raw)
    if (!Number.isFinite(petId)) return

    const snapshot = subject.getValue().pets
    if (!snapshot.some((p) => p.id === petId)) {
      set({
        pets: [
          ...snapshot,
          {
            id: petId,
            nome: `Pet #${petId}`,
            idade: 0,
          },
        ],
      })
    }

    try {
      set({
        linking: true,
        fieldErrors: Object.fromEntries(Object.entries(subject.getValue().fieldErrors).filter(([k]) => k !== 'petId')),
      })
      await tutorService.linkPet(s.tutorId, petId)
      set({ petIdText: '', success: 'Pet vinculado com sucesso' })

      void (async () => {
        try {
          const pet = await petService.getPetById(petId)
          const now = subject.getValue()
          set({ pets: now.pets.map((p) => (p.id === petId ? pet : p)) })
        } catch {
        } finally {
          void refreshPets(s.tutorId as number)
        }
      })()
    } catch (e: any) {
      set({
        pets: snapshot,
        error: e?.response?.data?.message || e?.message || 'Erro ao vincular pet',
      })
    } finally {
      set({ linking: false })
    }
  }

  async function unlinkPet(petId: number) {
    const s = subject.getValue()
    if (!s.tutorId) return
    const snapshot = subject.getValue().pets
    if (snapshot.some((p) => p.id === petId)) {
      set({ pets: snapshot.filter((p) => p.id !== petId) })
    }
    try {
      set({ linking: true })
      await tutorService.unlinkPet(s.tutorId, petId)
      await refreshPets(s.tutorId)
      set({ success: 'Vínculo removido com sucesso' })
    } catch (e: any) {
      set({
        pets: snapshot,
        error: e?.response?.data?.message || e?.message || 'Erro ao remover vínculo',
      })
    } finally {
      set({ linking: false })
    }
  }

  async function unlinkPetByInput() {
    const s = subject.getValue()
    if (!s.tutorId) return
    const raw = onlyDigits(s.petIdText)
    if (!raw) {
      set({ fieldErrors: { ...s.fieldErrors, petId: 'Informe o ID do pet' } })
      return
    }
    const petId = Number(raw)
    if (!Number.isFinite(petId)) return
    await unlinkPet(petId)
    set({ petIdText: '' })
  }

  function dispose() {
    alive = false
  }

  return {
    subject,
    reset,
    loadTutor,
    setNome: (value: string) => set({ nome: value }),
    setEmail: (value: string) => set({ email: value }),
    onChangeTelefone: (value: string) => set({ telefone: formatPhoneBR(value) }),
    setEndereco: (value: string) => set({ endereco: value }),
    onChangeCpf: (value: string) => set({ cpf: formatCpfBR(value) }),
    onPickPhoto: (file: File | null) => set({ photoFile: file }),
    removeExistingPhoto,
    setPetIdText: (value: string) => set({ petIdText: value }),
    submit,
    linkPet,
    unlinkPet,
    unlinkPetByInput,
    dispose,
  } as const
}

