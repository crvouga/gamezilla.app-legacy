import { TimeSpan } from '../time/time-span'

export type ThrottleBehavior = 'use-latest' | 'use-earliest' | 'drop'

export const throttleByKey = <TArgs extends unknown[]>(config: {
  throttle: TimeSpan
  keyFn: (...args: TArgs) => string
  fn: (...args: TArgs) => void
  behavior: ThrottleBehavior
}) => {
  const lastCall = new Map<string, number>()
  const pendingCalls = new Map<string, { args: TArgs; timeout: NodeJS.Timeout }>()

  return (...args: TArgs) => {
    const key = config.keyFn(...args)
    const now = Date.now()
    const last = lastCall.get(key) ?? 0
    const elapsed = now - last
    const throttleMs = TimeSpan.toMilliseconds(config.throttle)

    switch (config.behavior) {
      case 'use-latest': {
        if (elapsed >= throttleMs) {
          lastCall.set(key, now)
          config.fn(...args)
        }
        break
      }
      case 'use-earliest': {
        const pending = pendingCalls.get(key)
        if (pending) {
          clearTimeout(pending.timeout)
        }

        const timeout = setTimeout(() => {
          lastCall.set(key, Date.now())
          config.fn(...args)
          pendingCalls.delete(key)
        }, throttleMs - elapsed)

        pendingCalls.set(key, { args, timeout })
        break
      }
      case 'drop': {
        if (elapsed >= throttleMs) {
          lastCall.set(key, now)
          config.fn(...args)
        }
        break
      }
    }
  }
}
