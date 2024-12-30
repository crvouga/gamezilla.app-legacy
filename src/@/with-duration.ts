import { TimeSpan } from './time/time-span'

export const withDuration = async <T>(fn: () => Promise<T>): Promise<[T, TimeSpan]> => {
  const start = Date.now()
  const result = await fn()
  const end = Date.now()
  const duration = end - start
  return [result, TimeSpan.milliseconds(duration)]
}
