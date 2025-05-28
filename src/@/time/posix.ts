import { s } from '~/@/schema'
import { TimeSpan } from './time-span'

const parser = s.brand(s.num, 'Posix')
export type Posix = s.Infer<typeof parser>

const minPosixTime = new Date('1970-01-01T00:00:00.000Z').getTime()
const maxPosixTime = new Date('2038-01-19T03:14:07.999Z').getTime()

function explain(posixTime: unknown): string[] {
  const errors: string[] = []
  if (typeof posixTime !== 'number') {
    errors.push(`Expected a number, but got ${posixTime}`)
  }
  if (typeof posixTime === 'number' && posixTime < minPosixTime) {
    errors.push(`Expected a number greater than ${minPosixTime}, but got ${posixTime}`)
  }
  if (typeof posixTime === 'number' && posixTime > maxPosixTime) {
    errors.push(`Expected a number less than ${maxPosixTime}, but got ${posixTime}`)
  }
  return errors
}

function is(posixTime: unknown): posixTime is Posix {
  const errors = explain(posixTime)
  if (errors.length > 0) {
    return false
  }
  return true
}

const init = (posixTime: number | string): Posix => {
  const cleaned = typeof posixTime === 'string' ? Number.parseFloat(posixTime) : posixTime

  const clamped = Math.floor(Math.max(cleaned, minPosixTime))

  if (is(clamped)) {
    return clamped
  }
  throw new Error('impossible condition. failed to clamp posix time')
}

const toNumber = (posixTime: Posix): number => {
  return Math.floor(posixTime)
}

type Precision = 'milliseconds' | 'seconds' | 'minutes'

/**
 * Impure function that returns the current posix timestamp.
 */
const now = (config?: { precision: Precision }): Posix => {
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
const diff = (a: Posix, b: Posix): TimeSpan => {
  return TimeSpan.milliseconds(Math.abs(a - b))
}

const future = (posix: Posix, timeSpan: TimeSpan): Posix => {
  return init(toNumber(posix) + TimeSpan.toMilliseconds(timeSpan))
}

const past = (posix: Posix, timeSpan: TimeSpan): Posix => {
  return init(toNumber(posix) - TimeSpan.toMilliseconds(timeSpan))
}

const fromIsoString = (isoString: string): Posix => {
  return init(new Date(isoString).getTime())
}

const toIsoString = (posix: Posix): string => {
  return new Date(toNumber(posix)).toISOString()
}

const zero = init(0)

export const Posix = {
  ...parser,
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
