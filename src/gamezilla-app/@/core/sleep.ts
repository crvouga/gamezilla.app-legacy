import { TimeSpan } from './time-span'

export type Sleep = (timeSpan?: TimeSpan) => Promise<unknown>

export const sleep: Sleep = async (timeSpan) => {
  if (timeSpan) {
    await new Promise((resolve) => setTimeout(resolve, TimeSpan.toMilliseconds(timeSpan)))
  }
}
