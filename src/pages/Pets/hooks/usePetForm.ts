import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { petService } from '../../../services/petService'
import type { Pet } from '../../../types'

type Mode = 'create' | 'edit'

function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, '')
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function usePetForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()

  const petId = useMemo(() => {
    if (!id) return null
    const n = Number(id)
    return Number.isFinite(n) ? n : null
  }, [id])

  const mode: Mode = petId ? 'edit' : 'create'

  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [initialLoading, setInitialLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [especie, setEspecie] = useState('')
  const [idadeText, setIdadeText] = useState('')
  const [raca, setRaca] = useState('')

  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!petId) return
      try {
        setInitialLoading(true)
        setError(null)
        const pet = await petService.getPetById(petId)
        if (!mountedRef.current) return
        setNome(pet.nome || '')
        setEspecie(pet.especie || '')
        setIdadeText(String(pet.idade ?? ''))
        setRaca(pet.raca || '')
        setExistingPhotoUrl(pet.foto?.url || null)
      } catch (e: any) {
        if (!mountedRef.current) return
        setError(e?.response?.data?.message || e?.message || 'Erro ao carregar pet')
      } finally {
        if (!mountedRef.current) return
        setInitialLoading(false)
      }
    }

    if (mode === 'edit' && isAuthenticated && !authLoading) void load()
  }, [petId, mode, isAuthenticated, authLoading])

  const idadeNumber = useMemo(() => {
    const raw = onlyDigits(idadeText)
    if (!raw) return null
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    return clamp(n, 0, 80)
  }, [idadeText])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!nome.trim()) errs.nome = 'Informe o nome'
    if (idadeNumber === null) errs.idade = 'Informe a idade (apenas números)'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const onChangeIdade = (value: string) => {
    const raw = onlyDigits(value)
    if (!raw) {
      setIdadeText('')
      return
    }
    const n = clamp(Number(raw), 0, 80)
    setIdadeText(String(n))
  }

  const onPickPhoto = (file: File | null) => {
    setPhotoFile(file)
  }

  const submit = async () => {
    setSuccess(null)
    setError(null)
    if (!validate()) return
    if (idadeNumber === null) return

    try {
      setSaving(true)
      const payload: Omit<Pet, 'id'> = {
        nome: nome.trim(),
        idade: idadeNumber,
      }
      const especieTrim = especie.trim()
      const racaTrim = raca.trim()
      if (especieTrim) payload.especie = especieTrim
      if (racaTrim) payload.raca = racaTrim

      let saved: Pet
      if (mode === 'edit' && petId) {
        saved = await petService.updatePet(petId, payload)
      } else {
        saved = await petService.createPet(payload)
      }

      if (photoFile) {
        await petService.uploadPhoto(saved.id, photoFile)
      }

      if (!mountedRef.current) return
      setSuccess(mode === 'edit' ? 'Pet atualizado com sucesso' : 'Pet cadastrado com sucesso')
      setTimeout(() => navigate(`/pets/${saved.id}`), 500)
    } catch (e: any) {
      if (!mountedRef.current) return
      setError(e?.response?.data?.message || e?.message || 'Erro ao salvar pet')
    } finally {
      if (!mountedRef.current) return
      setSaving(false)
    }
  }

  return {
    mode,
    petId,
    authLoading,
    isAuthenticated,
    initialLoading,
    saving,
    error,
    success,

    nome,
    setNome,
    especie,
    setEspecie,
    idadeText,
    onChangeIdade,
    raca,
    setRaca,

    existingPhotoUrl,
    photoFile,
    onPickPhoto,

    fieldErrors,
    submit,
    cancel: () => navigate('/'),
  }
}

