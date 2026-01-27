export type StoredTokens = {
  accessToken: string
  refreshToken: string
  accessExpiresAt: number
  refreshExpiresAt: number
}

const ACCESS = 'access_token'
const REFRESH = 'refresh_token'
const ACCESS_EXPIRES = 'access_token_expires_at'
const REFRESH_EXPIRES = 'refresh_token_expires_at'

export function readTokens(): StoredTokens | null {
  const accessToken = localStorage.getItem(ACCESS)
  const refreshToken = localStorage.getItem(REFRESH)
  const accessExpiresAt = Number(localStorage.getItem(ACCESS_EXPIRES) || '')
  const refreshExpiresAt = Number(localStorage.getItem(REFRESH_EXPIRES) || '')

  if (!accessToken || !refreshToken) return null
  if (!Number.isFinite(accessExpiresAt) || !Number.isFinite(refreshExpiresAt)) return null
  return { accessToken, refreshToken, accessExpiresAt, refreshExpiresAt }
}

export function storeTokens(input: {
  access_token: string
  refresh_token: string
  expires_in?: number
  refresh_expires_in?: number
}) {
  const now = Date.now()
  const accessExpiresAt = now + Math.max(0, (input.expires_in ?? 0)) * 1000
  const refreshExpiresAt = now + Math.max(0, (input.refresh_expires_in ?? 0)) * 1000

  localStorage.setItem(ACCESS, input.access_token)
  localStorage.setItem(REFRESH, input.refresh_token)
  localStorage.setItem(ACCESS_EXPIRES, String(accessExpiresAt))
  localStorage.setItem(REFRESH_EXPIRES, String(refreshExpiresAt))
}

export function clearTokens() {
  localStorage.removeItem(ACCESS)
  localStorage.removeItem(REFRESH)
  localStorage.removeItem(ACCESS_EXPIRES)
  localStorage.removeItem(REFRESH_EXPIRES)
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH)
}

export function isAccessValid(now = Date.now()) {
  const t = readTokens()
  if (!t) return false
  return now < t.accessExpiresAt
}

export function isRefreshValid(now = Date.now()) {
  const t = readTokens()
  if (!t) return false
  return now < t.refreshExpiresAt
}

