import { BehaviorSubject } from 'rxjs'
import type { Pet, Tutor } from '../types'
import { tutorService } from '../services/tutorService'
import { petService } from '../services/petService'
import { getErrorMessage } from '../utils/errors'
import { formatCpfBR, formatPhoneBR, onlyDigits } from '../utils/masks'

type Mode = 'create' | 'edit'

export type TutorFormState = {
  mode: Mode
  tutorId: number | null
  initialLoading: boolean
  saving: boolean
  linking: boolean
  deleting: boolean
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
  removeExistingPhotoOnSave: boolean

  pets: Pet[]
  petsLoading: boolean
  petIdText: string
}
function coerceTutorPhoto(tutor: Tutor): { id: number | null; url: string | null } {
  const foto = tutor.foto
  if (!foto) return { id: null, url: null }
  if (typeof foto === 'string') return { id: null, url: foto }
  const id = typeof foto.id === 'number' ? foto.id : Number(foto.id)
  const safeId = Number.isFinite(id) ? id : null
  const url = typeof foto.url === 'string' ? foto.url : null
  return { id: safeId, url }
}

function readPetsFromUnknown(value: unknown): Pet[] | null {
  return Array.isArray(value) ? (value as unknown as Pet[]) : null
}

function getPetsFromTutorLoose(tutor: Tutor): Pet[] | null {
  // Alguns backends retornam variações de nome: pets, petsVinculados, animais...
  const rec = tutor as unknown as Record<string, unknown>
  return (
    readPetsFromUnknown(rec.pets) ||
    readPetsFromUnknown(rec.petsVinculados) ||
    readPetsFromUnknown(rec.animais) ||
    null
  )
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

export function createTutorFormStore() {
  const subject = new BehaviorSubject<TutorFormState>({
    mode: 'create',
    tutorId: null,
    initialLoading: false,
    saving: false,
    linking: false,
    deleting: false,
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
    removeExistingPhotoOnSave: false,
    pets: [],
    petsLoading: false,
    petIdText: '',
  })

  function set(patch: Partial<TutorFormState>) {
    subject.next({ ...subject.getValue(), ...patch })
  }

  function reset(mode: Mode, tutorId: number | null, initialLoading = false) {
    set({
      mode,
      tutorId,
      initialLoading,
      saving: false,
      linking: false,
      deleting: false,
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
      removeExistingPhotoOnSave: false,
      pets: [],
      petsLoading: false,
      petIdText: '',
    })
  }

  function validate() {
    const s = subject.getValue()
    const errs: Record<string, string> = {}
    if (!s.nome.trim()) errs.nome = 'Informe o nome completo'

    const phoneDigits = onlyDigits(s.telefone)
    if (!phoneDigits) errs.telefone = 'Informe o telefone'
    else if (phoneDigits.length < 10) errs.telefone = 'Telefone inválido'

    if (!s.endereco.trim()) errs.endereco = 'Informe o endereço'

    const emailTrim = s.email.trim()
    if (emailTrim && !emailTrim.includes('@')) errs.email = 'Email inválido'

    const cpfDigits = onlyDigits(s.cpf)
    if (cpfDigits && cpfDigits.length !== 11) errs.cpf = 'CPF inválido'
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
      const petsFromTutor = getPetsFromTutorLoose(tutor)
      if (petsFromTutor) set({ pets: petsFromTutor })
    } catch {
    }
  }

  async function loadTutor(tutorId: number) {
    try {
      set({ initialLoading: true, error: null })
      const tutor = await withTimeout(
        tutorService.getTutorById(tutorId),
        12000,
        'Demorando para carregar o tutor. Verifique sua conexão e tente novamente.'
      )
      const photo = coerceTutorPhoto(tutor)

      set({
        nome: tutor.nome || '',
        email: tutor.email || '',
        telefone: tutor.telefone ? formatPhoneBR(tutor.telefone) : '',
        endereco: tutor.endereco || '',
        cpf: tutor.cpf ? formatCpfBR(String(tutor.cpf)) : '',
        existingPhotoUrl: photo.url,
        existingPhotoId: photo.id,
        photoFile: null,
        removeExistingPhotoOnSave: false,
      })

      const petsFromTutor = getPetsFromTutorLoose(tutor)
      if (petsFromTutor) set({ pets: petsFromTutor })
      else await refreshPets(tutorId)
    } catch (e: unknown) {
      set({ error: getErrorMessage(e, 'Erro ao carregar tutor') })
    } finally {
      set({ initialLoading: false })
    }
  }

  function onPickPhoto(file: File | null) {
    // Se escolher nova foto, não faz sentido manter a remoção do existente marcada.
    set({ photoFile: file, removeExistingPhotoOnSave: file ? false : subject.getValue().removeExistingPhotoOnSave })
  }

  function setRemoveExistingPhotoOnSave(value: boolean) {
    const s = subject.getValue()
    const canMark = !!s.existingPhotoId && !!s.existingPhotoUrl && !s.photoFile
    set({ removeExistingPhotoOnSave: canMark ? value : false })
  }

  async function submit(navigateTo: (path: string) => void) {
    set({ success: null, error: null })
    if (!validate()) return
    const s = subject.getValue()

    const payload: Omit<Tutor, 'id'> = {
      nome: s.nome.trim(),
      telefone: s.telefone.trim(),
      endereco: s.endereco.trim(),
    }

    const emailTrim = s.email.trim()
    if (emailTrim) payload.email = emailTrim

    const cpfDigits = onlyDigits(s.cpf)
    if (cpfDigits) payload.cpf = Number(cpfDigits)

    try {
      set({ saving: true })
      let saved: Tutor
      if (s.mode === 'edit' && s.tutorId) {
        saved = await tutorService.updateTutor(s.tutorId, payload)
      } else {
        saved = await tutorService.createTutor(payload)
      }

      // Remoção remota da foto: só ocorre ao salvar.
      if (s.mode === 'edit' && s.tutorId && s.removeExistingPhotoOnSave && s.existingPhotoId) {
        await tutorService.deletePhoto(s.tutorId, s.existingPhotoId)
        set({ existingPhotoId: null, existingPhotoUrl: null, removeExistingPhotoOnSave: false })
      }

      if (s.photoFile) {
        await tutorService.uploadPhoto(saved.id, s.photoFile)
      }

      set({ success: s.mode === 'edit' ? 'Tutor atualizado com sucesso' : 'Tutor cadastrado com sucesso' })
      window.setTimeout(() => navigateTo(`/tutores/${saved.id}/editar`), 500)
    } catch (e: unknown) {
      set({ error: getErrorMessage(e, 'Erro ao salvar tutor') })
    } finally {
      set({ saving: false })
    }
  }

  async function deleteTutor(navigateTo: (path: string) => void) {
    const s = subject.getValue()
    if (!s.tutorId) return
    try {
      set({ deleting: true, error: null, success: null })
      await tutorService.deleteTutor(s.tutorId)
      navigateTo('/tutores')
    } catch (e: unknown) {
      set({ error: getErrorMessage(e, 'Erro ao excluir tutor') })
    } finally {
      set({ deleting: false })
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
    } catch (e: unknown) {
      set({
        pets: snapshot,
        error: getErrorMessage(e, 'Erro ao vincular pet'),
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
    } catch (e: unknown) {
      set({
        pets: snapshot,
        error: getErrorMessage(e, 'Erro ao remover vínculo'),
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

  return {
    subject,
    reset,
    loadTutor,
    setNome: (value: string) => set({ nome: value }),
    setEmail: (value: string) => set({ email: value }),
    onChangeTelefone: (value: string) => set({ telefone: formatPhoneBR(value) }),
    setEndereco: (value: string) => set({ endereco: value }),
    onChangeCpf: (value: string) => set({ cpf: formatCpfBR(value) }),
    onPickPhoto,
    setRemoveExistingPhotoOnSave,
    setPetIdText: (value: string) => set({ petIdText: value }),
    submit,
    deleteTutor,
    linkPet,
    unlinkPet,
    unlinkPetByInput,
  } as const
}

