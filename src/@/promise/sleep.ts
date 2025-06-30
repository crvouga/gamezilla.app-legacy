import { TimeSpan } from '../time/time-span'

export type Sleep = (timeSpan: TimeSpan, signal?: AbortSignal) => Promise<unknown>

/**
 * Sleeps for a given time span.
 * Can be aborted using the provided AbortSignal.
 */
export const sleep: Sleep = (timeSpan, signal) => {
  const ms = timeSpan ? TimeSpan.toMilliseconds(timeSpan) : 0

  return new Promise<true>((resolve, _reject) => {
    const timeoutId = setTimeout(() => resolve(true), ms)

    const onAbort = () => {
      clearTimeout(timeoutId)
      signal?.removeEventListener('abort', onAbort)
      // reject(new Error('Sleep aborted'))
    }

    if (signal) {
      if (signal.aborted) {
        onAbort()
      } else {
        signal.addEventListener('abort', onAbort)
      }
    }
  })
}
