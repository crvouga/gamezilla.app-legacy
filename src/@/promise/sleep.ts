import { TimeSpan } from '../time/time-span'

export type Sleep = (timeSpan?: TimeSpan) => Promise<unknown>

/**
 * Sleeps for a given time span.
 */
export const sleep: Sleep = async (timeSpan) => {
  if (timeSpan) {
    const ms = TimeSpan.toMilliseconds(timeSpan)
    await new Promise((resolve) => setTimeout(resolve, ms))
  }
}
