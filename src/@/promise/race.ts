export type AbortablePromise<T> = (signal: AbortSignal) => Promise<T>

/**
 * Races multiple abortable promises against each other, returning the result of the first one to complete
 * and aborting all others. Returns null for any aborted promises.
 *
 * @example
 * ```ts
 * const signal = new AbortSignal()
 * const result = await race(signal, {
 *   fast: async (signal) => {
 *     await sleep(100)
 *     return 'fast'
 *   },
 *   slow: async (signal) => {
 *     await sleep(1000)
 *     return 'slow'
 *   }
 * })
 * // result = { fast: 'fast', slow: null }
 * ```
 */
export const race = async <T extends Record<string, AbortablePromise<unknown>>>(
  signal: AbortSignal,
  promises: T,
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> | null }> => {
  const controllers: Record<string, AbortController> = {}
  const results: Record<string, unknown | null> = {}

  const wrapped: Array<Promise<{ key: keyof T; value: unknown }>> = []

  // Create a promise that rejects when the input signal is aborted
  const abortPromise = new Promise<never>((_, reject) => {
    signal.addEventListener('abort', () => {
      reject(new Error('Race aborted'))
    })
  })

  for (const key in promises) {
    const controller = new AbortController()
    controllers[key] = controller

    const p = promises[key]!(controller.signal)
      .then((value) => ({ key, value }))
      .catch(() => ({ key, value: null }))

    wrapped.push(p)
  }

  try {
    const winner = await Promise.race([...wrapped, abortPromise])

    // Abort the losers
    for (const key in controllers) {
      if (key !== winner.key) {
        controllers[key]!.abort()
        results[key] = null
      } else {
        results[key] = winner.value
      }
    }

    return results as { [K in keyof T]: Awaited<ReturnType<T[K]>> | null }
  } catch (error) {
    // If aborted, abort all controllers and return null results

    for (const key in controllers) {
      controllers[key]!.abort()
      results[key] = null
    }
    throw error
  }
}
