import { Err, isOk, Result } from '../result'

export const FromUnknown = <T>() => {
  const fromUnknownRegistry: ((data: unknown) => Result<string, T>)[] = []

  const fromUnknownRegister = (fn: (data: unknown) => Result<string, T>) => {
    fromUnknownRegistry.push(fn)
  }

  const fromUnknown = (data: unknown): Result<string, T> => {
    for (const fn of fromUnknownRegistry) {
      const result = fn(data)
      if (isOk(result)) {
        return result
      }
    }
    return Err('Failed to parse from unknown. No matching function found.')
  }

  return {
    fromUnknownRegister,
    fromUnknown,
  }
}
