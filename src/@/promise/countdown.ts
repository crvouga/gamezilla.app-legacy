import { TimeSpan } from '../time/time-span'

export type CountdownCallback = (remaining: TimeSpan) => void

export type Countdown = (timeSpan: TimeSpan, callback: CountdownCallback, signal?: AbortSignal) => Promise<true>

/**
 * Counts down for a given time span, calling the callback with remaining time at each interval.
 * Can be aborted using the provided AbortSignal.
 */
export const countdown: Countdown = (timeSpan, callback, signal) => {
  const totalMs = timeSpan ? TimeSpan.toMilliseconds(timeSpan) : 0
  const intervalMs = 1000 // Update every second

  return new Promise<true>((resolve, _reject) => {
    let remainingMs = totalMs
    let timeoutId: ReturnType<typeof setTimeout>

    const tick = () => {
      remainingMs -= intervalMs
      callback(TimeSpan.milliseconds(remainingMs))

      if (remainingMs <= 0) {
        resolve(true)
      } else {
        timeoutId = setTimeout(tick, intervalMs)
      }
    }

    // Call immediately for initial state
    callback(TimeSpan.milliseconds(remainingMs))
    timeoutId = setTimeout(tick, intervalMs)

    const onAbort = () => {
      clearTimeout(timeoutId)
      signal?.removeEventListener('abort', onAbort)
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
