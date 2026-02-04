export type AsyncCacheOptions = {
  ttlMs: number
}

type Entry<V> = {
  value?: V
  promise?: Promise<V>
  expiresAt: number
}

export function createAsyncCache<K, V>(options: AsyncCacheOptions) {
  const { ttlMs } = options
  const map = new Map<K, Entry<V>>()

  function get(key: K): V | undefined {
    const e = map.get(key)
    if (!e) return undefined
    if (e.value === undefined) return undefined
    if (Date.now() >= e.expiresAt) {
      map.delete(key)
      return undefined
    }
    return e.value
  }

  function invalidate(key: K) {
    map.delete(key)
  }

  function clear() {
    map.clear()
  }

  async function getOrLoad(key: K, loader: () => Promise<V>): Promise<V> {
    const now = Date.now()
    const existing = map.get(key)

    if (existing?.value !== undefined && now < existing.expiresAt) {
      return existing.value
    }

    if (existing?.promise) {
      return existing.promise
    }

    const p = loader()
      .then((value) => {
        map.set(key, { value, expiresAt: Date.now() + ttlMs })
        return value
      })
      .catch((err) => {
        map.delete(key)
        throw err
      })

    map.set(key, { promise: p, expiresAt: now + ttlMs })
    return p
  }

  return {
    get,
    getOrLoad,
    invalidate,
    clear,
  } as const
}

