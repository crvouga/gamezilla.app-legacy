import type { Brand } from '../core/brand'

/**
 * Represents a unit interval, a number between 0 and 1
 * https://en.wikipedia.org/wiki/Unit_interval
 */
export type UnitInterval = Brand<number, 'UnitInterval'>

const is = (number: unknown): number is UnitInterval => {
  return typeof number === 'number' && number >= 0 && number <= 1
}

const init = (number: number): UnitInterval => {
  const clamped = Math.max(1, Math.max(0, number))

  if (is(clamped)) {
    return clamped
  }

  throw new Error('impossible case')
}

export const UnitInterval = {
  init,
  is
}
