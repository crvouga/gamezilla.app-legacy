import { LRUCache } from "gamezilla-app/@SHARED/least-recently-used-cache.ts/least-recently-used-cache"

/**
 * @description
 * optimization for expensive function calls by caching results
 */
export const memoize = <TInput, TOutput extends {}>({
  toKey,
  func,
  cacheCapacity,
}: {
  toKey: (x: TInput) => string | number
  func: (x: TInput) => TOutput
  cacheCapacity: number
}) => {
  const cache = new LRUCache<string | number, TOutput>({
    max: cacheCapacity,
  })

  return (x: TInput): TOutput => {
    const key = toKey(x)

    const cached = cache.get(key)

    if (cached) {
      return cached
    }

    const y = func(x)

    cache.set(key, y)

    return y
  }
}

export const memoizeAsync = <TInput, TOutput extends {}>({
  toKey,
  func,
  cacheCapacity,
}: {
  toKey: (x: TInput) => string | number
  func: (x: TInput) => Promise<TOutput>
  cacheCapacity: number
}) => {
  const cache = new LRUCache<string | number, TOutput>({
    max: cacheCapacity,
  })

  return async (x: TInput): Promise<TOutput> => {
    const key = toKey(x)

    const cached = cache.get(key)

    if (cached) {
      return cached
    }

    const y = await func(x)

    cache.set(key, y)

    return y
  }
}
