function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getNestedMessage(value: unknown): string | null {
  if (!isRecord(value)) return null
  const message = value.message
  if (typeof message === 'string' && message.trim()) return message
  return null
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback

  // Erro genérico (Error)
  if (isRecord(err) && typeof err.message === 'string' && err.message.trim()) {
    return err.message
  }

  // Axios-like: err.response.data.message
  if (isRecord(err)) {
    const response = err.response
    if (isRecord(response)) {
      const data = response.data
      const msg = getNestedMessage(data)
      if (msg) return msg
    }
  }

  return fallback
}

