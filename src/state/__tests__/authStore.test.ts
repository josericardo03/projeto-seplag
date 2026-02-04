import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { AUTH_EVENTS } from '../../utils/authEvents'
import { TOKEN_STORAGE_KEYS, storeTokens, clearTokens } from '../../services/tokenStorage'

function setRawTokens(params: { accessToken: string; refreshToken: string; accessExpiresAt: number; refreshExpiresAt: number }) {
  localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS, params.accessToken)
  localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH, params.refreshToken)
  localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_EXPIRES, String(params.accessExpiresAt))
  localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_EXPIRES, String(params.refreshExpiresAt))
}

vi.mock('../../services/authService', async () => {
  const { storeTokens } = await import('../../services/tokenStorage')
  return {
    authService: {
      login: vi.fn(async () => {
        storeTokens({ access_token: 'a', refresh_token: 'r', expires_in: 60, refresh_expires_in: 600 })
        return { access_token: 'a', refresh_token: 'r', expires_in: 60, refresh_expires_in: 600 }
      }),
      refreshToken: vi.fn(async () => {
        storeTokens({ access_token: 'a2', refresh_token: 'r2', expires_in: 60, refresh_expires_in: 600 })
        return { access_token: 'a2', refresh_token: 'r2', expires_in: 60, refresh_expires_in: 600 }
      }),
      logout: vi.fn(() => clearTokens()),
    },
  }
})

vi.mock('../../services/petService', () => ({
  petService: { clearCache: vi.fn() },
}))

vi.mock('../../services/tutorService', () => ({
  tutorService: { clearCache: vi.fn() },
}))

describe('authStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetModules()
    localStorage.clear()
  })

  it('faz refresh proativo antes do access expirar', async () => {
    const now = Date.now()
    // expira em 40s -> refresh deve ocorrer em 10s (skew 30s)
    setRawTokens({
      accessToken: 'a',
      refreshToken: 'r',
      accessExpiresAt: now + 40_000,
      refreshExpiresAt: now + 10 * 60_000,
    })

    const { authStore } = await import('../authStore')
    const { authService } = await import('../../services/authService')

    await authStore.init()
    expect(authStore.subject.getValue().isAuthenticated).toBe(true)

    await vi.advanceTimersByTimeAsync(10_500)

    expect(authService.refreshToken).toHaveBeenCalledTimes(1)
    expect(authStore.subject.getValue().isAuthenticated).toBe(true)
  })

  it('desloga imediatamente ao receber evento de logout', async () => {
    storeTokens({ access_token: 'a', refresh_token: 'r', expires_in: 60, refresh_expires_in: 600 })

    const { authStore } = await import('../authStore')
    await authStore.init()
    expect(authStore.subject.getValue().isAuthenticated).toBe(true)

    // simula interceptor limpando tokens + emitindo evento
    localStorage.clear()
    window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGOUT, { detail: { reason: 'refresh_failed' } }))

    expect(authStore.subject.getValue().isAuthenticated).toBe(false)
  })

  it('sincroniza autenticação via storage event (multi-aba)', async () => {
    const { authStore } = await import('../authStore')
    await authStore.init()
    expect(authStore.subject.getValue().isAuthenticated).toBe(false)

    storeTokens({ access_token: 'a', refresh_token: 'r', expires_in: 60, refresh_expires_in: 600 })

    window.dispatchEvent(new StorageEvent('storage', { key: TOKEN_STORAGE_KEYS.ACCESS, newValue: 'a' }))

    expect(authStore.subject.getValue().isAuthenticated).toBe(true)
  })
})

