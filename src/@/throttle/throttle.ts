import { TimeSpan } from '../time/time-span'

export type ThrottleBehavior = 'use-latest' | 'use-earliest' | 'drop'
export const throttleByKey = <TArgs extends unknown[]>(config: {
  throttle: TimeSpan
  keyFn: (...args: TArgs) => string
  fn: (...args: TArgs) => void
  behavior: ThrottleBehavior
}) => {
  const lastCall = new Map<string, number>()
  const pendingCalls = new Map<string, { args: TArgs; timeout: ReturnType<typeof setTimeout> }>()

  return (...args: TArgs) => {
    const key = config.keyFn(...args)
    const now = Date.now()
    const last = lastCall.get(key) ?? 0
    const elapsed = Math.max(0, now - last)
    const throttleMs = TimeSpan.toMilliseconds(config.throttle)

    switch (config.behavior) {
      case 'use-latest': {
        const pending = pendingCalls.get(key)
        if (pending) clearTimeout(pending.timeout)

        const timeout = setTimeout(
          () => {
            lastCall.set(key, Date.now())
            config.fn(...args)
            pendingCalls.delete(key)
          },
          Math.max(0, throttleMs - elapsed),
        )

        pendingCalls.set(key, { args, timeout })
        break
      }

      case 'use-earliest': {
        if (pendingCalls.has(key)) return

        const timeout = setTimeout(
          () => {
            lastCall.set(key, Date.now())
            config.fn(...args)
            pendingCalls.delete(key)
          },
          Math.max(0, throttleMs - elapsed),
        )

        pendingCalls.set(key, { args, timeout })
        break
      }

      case 'drop': {
        lastCall.set(key, now)
        if (elapsed >= throttleMs) {
          config.fn(...args)
        }
        break
      }
    }
  }
}
