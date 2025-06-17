import { s } from '~/@/schema'
import { TimeSpan } from './time-span'

const schema = s.brand(s.num(), 'UnixMs')

/**
 * UnixMs represents the number of milliseconds since Jan 1, 1970 UTC 00:00:00.
 */
export type UnixMs = s.Infer<typeof schema>

const MIN = 0

const explain = (unixMsTime: unknown): string[] => {
  const errors: string[] = []
  if (typeof unixMsTime !== 'number') {
    errors.push(`Expected a number, but got ${unixMsTime}`)
  }
  if (typeof unixMsTime === 'number' && unixMsTime < MIN) {
    errors.push(`Expected a number greater than ${MIN}, but got ${unixMsTime}`)
  }
  return errors
}

const is = (unixMsTime: unknown): unixMsTime is UnixMs => {
  const errors = explain(unixMsTime)
  if (errors.length > 0) {
    return false
  }
  return true
}

const init = (unixMsTime: number | string): UnixMs => {
  const cleaned = typeof unixMsTime === 'string' ? Number.parseFloat(unixMsTime) : unixMsTime

  const clamped = Math.floor(Math.max(cleaned, MIN))

  if (is(clamped)) {
    return clamped
  }
  throw new Error('impossible condition. failed to clamp unixMs time')
}

const toNumber = (unixMsTime: UnixMs): number => {
  return Math.floor(unixMsTime)
}

type Precision = 'milliseconds' | 'seconds' | 'minutes'

/**
 * Impure function that returns the current unixMs timestamp.
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
 * Returns the time span between two unixMs timestamps.
 */
const diff = (a: UnixMs, b: UnixMs): TimeSpan => {
  return TimeSpan.milliseconds(Math.abs(a - b))
}

const future = (unixMs: UnixMs, timeSpan: TimeSpan): UnixMs => {
  return init(toNumber(unixMs) + TimeSpan.toMilliseconds(timeSpan))
}

const past = (unixMs: UnixMs, timeSpan: TimeSpan): UnixMs => {
  return init(toNumber(unixMs) - TimeSpan.toMilliseconds(timeSpan))
}

const fromIsoString = (isoString: string): UnixMs => {
  return init(new Date(isoString).getTime())
}

const toIsoString = (unixMs: UnixMs): string => {
  return new Date(toNumber(unixMs)).toISOString()
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
