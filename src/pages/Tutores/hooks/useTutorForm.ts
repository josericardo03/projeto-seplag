import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { tutorService } from '../../../services/tutorService'
import { petService } from '../../../services/petService'
import type { Pet, Tutor } from '../../../types'

type Mode = 'create' | 'edit'

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

export function useTutorForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()

  const tutorId = useMemo(() => {
    if (!id) return null
    const n = Number(id)
    return Number.isFinite(n) ? n : null
  }, [id])

  const mode: Mode = tutorId ? 'edit' : 'create'
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [initialLoading, setInitialLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [linking, setLinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cpf, setCpf] = useState('')

  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null)
  const [existingPhotoId, setExistingPhotoId] = useState<number | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [removingPhoto, setRemovingPhoto] = useState(false)

  const [pets, setPets] = useState<Pet[]>([])
  const [petsLoading, setPetsLoading] = useState(false)
  const [petIdText, setPetIdText] = useState('')

  const petsRef = useRef<Pet[]>([])
  useEffect(() => {
    petsRef.current = pets
  }, [pets])

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!nome.trim()) errs.nome = 'Informe o nome completo'
    if (!email.trim()) errs.email = 'Informe o email'
    const cpfDigits = onlyDigits(cpf)
    if (!cpfDigits) errs.cpf = 'Informe o CPF'
    else if (cpfDigits.length !== 11) errs.cpf = 'CPF inválido'
    const digits = onlyDigits(telefone)
    if (digits && digits.length < 10) errs.telefone = 'Telefone inválido'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const loadPets = async (id: number) => {
    try {
      setPetsLoading(true)
      const list = await tutorService.getTutorPets(id)
      if (!mountedRef.current) return
      setPets(list || [])
    } catch {
      if (!mountedRef.current) return
    } finally {
      if (!mountedRef.current) return
      setPetsLoading(false)
    }
  }

  const refreshPets = async (id: number) => {
    try {
      await loadPets(id)
      return
    } catch {
    }
    try {
      const tutor = await tutorService.getTutorById(id)
      if (!mountedRef.current) return
      const petsFromTutor =
        (tutor as any).pets ||
        (tutor as any).petsVinculados ||
        (tutor as any).animais ||
        null
      if (Array.isArray(petsFromTutor)) setPets(petsFromTutor)
    } catch {
    }
  }

  useEffect(() => {
    const load = async () => {
      if (!tutorId) return
      try {
        setInitialLoading(true)
        setError(null)
        const tutor = await tutorService.getTutorById(tutorId)
        if (!mountedRef.current) return
        setNome(tutor.nome || '')
        setEmail(tutor.email || '')
        setTelefone(tutor.telefone ? formatPhoneBR(tutor.telefone) : '')
        setEndereco(tutor.endereco || '')
        setCpf(tutor.cpf ? formatCpfBR(String(tutor.cpf)) : '')
        const photo = coerceTutorPhoto(tutor)
        setExistingPhotoUrl(photo.url)
        setExistingPhotoId(photo.id)
        const petsFromTutor =
          (tutor as any).pets ||
          (tutor as any).petsVinculados ||
          (tutor as any).animais ||
          null
        if (Array.isArray(petsFromTutor)) setPets(petsFromTutor)
        else await refreshPets(tutorId)
      } catch (e: any) {
        if (!mountedRef.current) return
        setError(e?.response?.data?.message || e?.message || 'Erro ao carregar tutor')
      } finally {
        if (!mountedRef.current) return
        setInitialLoading(false)
      }
    }

    if (mode === 'edit' && isAuthenticated && !authLoading) void load()
  }, [tutorId, mode, isAuthenticated, authLoading])

  const onChangeTelefone = (value: string) => {
    setTelefone(formatPhoneBR(value))
  }

  const onChangeCpf = (value: string) => {
    setCpf(formatCpfBR(value))
  }

  const onPickPhoto = (file: File | null) => {
    setPhotoFile(file)
  }

  const removeExistingPhoto = async () => {
    if (!tutorId || !existingPhotoId) return
    try {
      setRemovingPhoto(true)
      setError(null)
      await tutorService.deletePhoto(tutorId, existingPhotoId)
      if (!mountedRef.current) return
      setExistingPhotoId(null)
      setExistingPhotoUrl(null)
      setSuccess('Foto removida com sucesso')
    } catch (e: any) {
      if (!mountedRef.current) return
      setError(e?.response?.data?.message || e?.message || 'Erro ao remover foto')
    } finally {
      if (!mountedRef.current) return
      setRemovingPhoto(false)
    }
  }

  const submit = async () => {
    setSuccess(null)
    setError(null)
    if (!validate()) return

    const payload: Omit<Tutor, 'id'> = {
      nome: nome.trim(),
      email: email.trim(),
      cpf: Number(onlyDigits(cpf)),
    }
    if (telefone.trim()) payload.telefone = telefone.trim()
    if (endereco.trim()) payload.endereco = endereco.trim()

    try {
      setSaving(true)
      let saved: Tutor
      if (mode === 'edit' && tutorId) {
        saved = await tutorService.updateTutor(tutorId, payload)
      } else {
        saved = await tutorService.createTutor(payload)
      }

      if (photoFile) {
        await tutorService.uploadPhoto(saved.id, photoFile)
      }

      if (!mountedRef.current) return
      setSuccess(mode === 'edit' ? 'Tutor atualizado com sucesso' : 'Tutor cadastrado com sucesso')
      setTimeout(() => navigate(`/tutores/${saved.id}/editar`), 500)
    } catch (e: any) {
      if (!mountedRef.current) return
      setError(e?.response?.data?.message || e?.message || 'Erro ao salvar tutor')
    } finally {
      if (!mountedRef.current) return
      setSaving(false)
    }
  }

  const onLinkPet = async () => {
    if (!tutorId) return
    const raw = onlyDigits(petIdText)
    if (!raw) {
      setFieldErrors((prev) => ({ ...prev, petId: 'Informe o ID do pet' }))
      return
    }
    const petId = Number(raw)
    if (!Number.isFinite(petId)) return

    const snapshot = petsRef.current
    if (!snapshot.some((p) => p.id === petId)) {
      setPets([
        ...snapshot,
        {
          id: petId,
          nome: `Pet #${petId}`,
          idade: 0,
        },
      ])
    }

    try {
      setLinking(true)
      setFieldErrors((prev) => {
        const { petId: _petId, ...rest } = prev
        return rest
      })
      await tutorService.linkPet(tutorId, petId)
      if (!mountedRef.current) return
      setPetIdText('')
      setSuccess('Pet vinculado com sucesso')

      void (async () => {
        try {
          const pet = await petService.getPetById(petId)
          if (!mountedRef.current) return
          setPets((prev) => prev.map((p) => (p.id === petId ? pet : p)))
        } catch {
        } finally {
          void refreshPets(tutorId)
        }
      })()
    } catch (e: any) {
      if (!mountedRef.current) return
      setPets(snapshot)
      setError(e?.response?.data?.message || e?.message || 'Erro ao vincular pet')
    } finally {
      if (!mountedRef.current) return
      setLinking(false)
    }
  }

  const onUnlinkPetByInput = async () => {
    if (!tutorId) return
    const raw = onlyDigits(petIdText)
    if (!raw) {
      setFieldErrors((prev) => ({ ...prev, petId: 'Informe o ID do pet' }))
      return
    }
    const petId = Number(raw)
    if (!Number.isFinite(petId)) return
    await onUnlinkPet(petId)
    if (!mountedRef.current) return
    setPetIdText('')
  }

  const onUnlinkPet = async (petId: number) => {
    if (!tutorId) return
    const snapshot = petsRef.current
    if (snapshot.some((p) => p.id === petId)) {
      setPets(snapshot.filter((p) => p.id !== petId))
    }
    try {
      setLinking(true)
      await tutorService.unlinkPet(tutorId, petId)
      await refreshPets(tutorId)
      if (!mountedRef.current) return
      setSuccess('Vínculo removido com sucesso')
    } catch (e: any) {
      if (!mountedRef.current) return
      setPets(snapshot)
      setError(e?.response?.data?.message || e?.message || 'Erro ao remover vínculo')
    } finally {
      if (!mountedRef.current) return
      setLinking(false)
    }
  }

  return {
    mode,
    tutorId,
    authLoading,
    isAuthenticated,
    initialLoading,
    saving,
    linking,
    error,
    success,
    fieldErrors,

    nome,
    setNome,
    email,
    setEmail,
    telefone,
    onChangeTelefone,
    endereco,
    setEndereco,
    cpf,
    onChangeCpf,

    existingPhotoUrl,
    existingPhotoId,
    photoFile,
    onPickPhoto,
    removeExistingPhoto,
    removingPhoto,

    pets,
    petsLoading,
    petIdText,
    setPetIdText,
    linkPet: onLinkPet,
    unlinkPet: onUnlinkPet,
    unlinkPetByInput: onUnlinkPetByInput,

    submit,
    cancel: () => navigate('/tutores'),
  }
}

