import { TimeSpan } from '../time/time-span'

export const throttleByKey = <T extends unknown[]>(config: {
  throttle: TimeSpan
  keyFn: (...args: T) => string
  fn: (...args: T) => void
}) => {
  const lastCall = new Map<string, number>()

  return (...args: T) => {
    const key = config.keyFn(...args)
    const now = Date.now()
    const last = lastCall.get(key) ?? 0
    const elapsed = now - last

    if (elapsed >= TimeSpan.toMilliseconds(config.throttle)) {
      lastCall.set(key, now)
      config.fn(...args)
    }
  }
}
