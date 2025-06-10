import { s } from '~/@/schema'
import { TimeSpan } from './time-span'

const schema = s.brand(s.num(), 'UnixMs')

/**
 * UnixMs represents the number of milliseconds since Jan 1, 1970 UTC 00:00:00.
 */
export type UnixMs = s.Infer<typeof schema>

const MIN = 0

const explain = (posixTime: unknown): string[] => {
  const errors: string[] = []
  if (typeof posixTime !== 'number') {
    errors.push(`Expected a number, but got ${posixTime}`)
  }
  if (typeof posixTime === 'number' && posixTime < MIN) {
    errors.push(`Expected a number greater than ${MIN}, but got ${posixTime}`)
  }
  return errors
}

const is = (posixTime: unknown): posixTime is UnixMs => {
  const errors = explain(posixTime)
  if (errors.length > 0) {
    return false
  }
  return true
}

const init = (posixTime: number | string): UnixMs => {
  const cleaned = typeof posixTime === 'string' ? Number.parseFloat(posixTime) : posixTime

  const clamped = Math.floor(Math.max(cleaned, MIN))

  if (is(clamped)) {
    return clamped
  }
  throw new Error('impossible condition. failed to clamp posix time')
}

const toNumber = (posixTime: UnixMs): number => {
  return Math.floor(posixTime)
}

type Precision = 'milliseconds' | 'seconds' | 'minutes'

/**
 * Impure function that returns the current posix timestamp.
 */
const now = (config?: { precision: Precision }): UnixMs => {
  let timestamp = Date.now()

  if (config?.precision) {
    switch (config.precision) {
      case 'seconds':
        timestamp = Math.floor(timestamp / 1000) * 1000
        break
      case 'minutes':
        timestamp = Math.floor(timestamp / 60000) * 60000
        break
    }
  }

  return init(timestamp)
}
/**
 * Returns the time span between two posix timestamps.
 */
const diff = (a: UnixMs, b: UnixMs): TimeSpan => {
  return TimeSpan.milliseconds(Math.abs(a - b))
}

const future = (posix: UnixMs, timeSpan: TimeSpan): UnixMs => {
  return init(toNumber(posix) + TimeSpan.toMilliseconds(timeSpan))
}

const past = (posix: UnixMs, timeSpan: TimeSpan): UnixMs => {
  return init(toNumber(posix) - TimeSpan.toMilliseconds(timeSpan))
}

const fromIsoString = (isoString: string): UnixMs => {
  return init(new Date(isoString).getTime())
}

const toIsoString = (posix: UnixMs): string => {
  return new Date(toNumber(posix)).toISOString()
}

const zero = init(0)

export const UnixMs = {
  ...schema,
  zero,
  is,
  init,
  toNumber,
  now,
  diff,
  future,
  past,
  fromIsoString,
  toIsoString,
}
