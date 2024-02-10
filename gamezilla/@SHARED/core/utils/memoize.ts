import { LRUCache } from "gamezilla/@SHARED/data-structures/least-recently-used-cache"

/**
 * @description
 * optimization for expensive function calls by caching results
 *
 * @example
 * // O(n^2) time complexity
 * const fibonacci = (n) =>
 *   n <= 1 ? 1 : fibonacci(n - 1) + fibonacci(n - 2)
 *
 * // O(n) time complexity on the first call
 * // O(1) time complexity on subsequent calls
 * const memoizedFibonacci = memoize(fibonacci)
 *
 */
export const memoize = <TInput, TOutput>({
  toKey,
  func,
  cacheCapacity,
}: {
  toKey: (x: TInput) => string | number
  func: (x: TInput) => TOutput
  cacheCapacity: number
}) => {
  const cache = new LRUCache<string | number, TOutput>({
    capacity: cacheCapacity,
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

export const memoizeAsync = <TInput, TOutput>({
  toKey,
  func,
  cacheCapacity,
}: {
  toKey: (x: TInput) => string | number
  func: (x: TInput) => Promise<TOutput>
  cacheCapacity: number
}) => {
  const cache = new LRUCache<string | number, TOutput>({
    capacity: cacheCapacity,
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
