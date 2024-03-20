import { Brand } from "../brand"
import { TimeSpan } from "./time-span"

export type Posix = Brand<number, "Posix">

const minPosixTime = new Date("1970-01-01T00:00:00.000Z").getTime()
const maxPosixTime = new Date("2038-01-19T03:14:07.999Z").getTime()

function explain(posixTime: unknown): string[] {
  const errors: string[] = []
  if (typeof posixTime !== "number") {
    errors.push(`Expected a number, but got ${posixTime}`)
  }
  if (typeof posixTime === "number" && posixTime < minPosixTime) {
    errors.push(
      `Expected a number greater than ${minPosixTime}, but got ${posixTime}`,
    )
  }
  if (typeof posixTime === "number" && posixTime > maxPosixTime) {
    errors.push(
      `Expected a number less than ${maxPosixTime}, but got ${posixTime}`,
    )
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
is.explain = explain

const fromNumber = (posixTime: number): Posix => {
  const clamped = Math.max(posixTime, minPosixTime)
  if (is(clamped)) {
    return clamped
  }
  throw new Error("impossible condition. failed to clamp posix time")
}

const toNumber = (posixTime: Posix): number => {
  return posixTime
}

/**
 * Impure function that returns the current posix timestamp.
 */
const now = (): Posix => {
  return fromNumber(Date.now())
}

/**
 * Returns the time span between two posix timestamps.
 */
const diff = (a: Posix, b: Posix): TimeSpan => {
  return TimeSpan.fromMilliseconds(Math.abs(a - b))
}

const add = (posix: Posix, timeSpan: TimeSpan): Posix => {
  return fromNumber(toNumber(posix) + TimeSpan.toMilliseconds(timeSpan))
}

const fromIsoString = (isoString: string): Posix => {
  return fromNumber(new Date(isoString).getTime())
}

const toIsoString = (posix: Posix): string => {
  return new Date(toNumber(posix)).toISOString()
}

const zero = fromNumber(0)

export const Posix = {
  zero,
  is,
  fromNumber,
  toNumber,
  now,
  diff,
  add,
  fromIsoString,
  toIsoString,
}
