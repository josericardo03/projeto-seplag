export const AUTH_EVENTS = {
  LOGOUT: 'auth:logout',
} as const

export type AuthLogoutReason = 'refresh_failed' | 'refresh_missing_or_expired' | 'manual'

