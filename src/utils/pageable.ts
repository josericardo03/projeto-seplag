import type { PageableResponse } from '../types'

export type PageableFallback = {
  page: number
  size: number
}

type PageLike<T> = {
  content?: T[]
  totalElements?: number
  totalPages?: number
  size?: number
  number?: number
  page?: number
  total?: number
  pageCount?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asNumber(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : undefined
}

export function adaptPageableResponse<T>(data: unknown, fallback: PageableFallback): PageableResponse<T> {
  const d: PageLike<T> = isRecord(data) ? (data as unknown as PageLike<T>) : {}
  const content = Array.isArray(d.content) ? d.content : []

  const totalElements = asNumber(d.total ?? d.totalElements) ?? 0
  const totalPages = asNumber(d.pageCount ?? d.totalPages) ?? 0
  const size = asNumber(d.size) ?? fallback.size
  const number = asNumber(d.page ?? d.number) ?? fallback.page

  return {
    content,
    totalElements,
    totalPages,
    size,
    number,
    first: number === 0,
    last: number >= Math.max(0, totalPages - 1),
  }
}

