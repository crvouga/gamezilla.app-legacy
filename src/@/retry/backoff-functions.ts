import { TimeSpan } from '../time/time-span'

export type BackoffFunction = (state: { attempt: number; maxAttempts: number }) => TimeSpan

const exponential =
  (config: { baseDelay: TimeSpan; maxDelay: TimeSpan }): BackoffFunction =>
  (state) => {
    const baseDelayMs = TimeSpan.toMilliseconds(config.baseDelay)
    const maxDelayMs = TimeSpan.toMilliseconds(config.maxDelay)
    const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** state.attempt)
    return TimeSpan.milliseconds(delay)
  }

export const BackoffFunction = {
  exponential,
}
