import { describe, expect, it } from 'bun:test'
import { LamportClock } from './lamport-clock'

describe('LamportClock', () => {
  it('should update the Lamport clock when receiving a smaller timestamp', async () => {
    const clockA = LamportClock.init
    const clockB = LamportClock.init

    const updatedClockA = LamportClock.increment(clockA)
    const updatedClockB = LamportClock.update(clockB, updatedClockA)

    expect(LamportClock.toNumber(updatedClockB)).toBe(2)
  })

  it('should not update the Lamport clock when receiving an equal timestamp', async () => {
    const clockA = LamportClock.init
    const clockB = LamportClock.init

    const updatedClockA = LamportClock.increment(clockA)
    const updatedClockB = LamportClock.update(clockB, updatedClockA)

    const updatedClockB2 = LamportClock.update(updatedClockB, updatedClockA)

    expect(LamportClock.toNumber(updatedClockB2)).toBe(3)
  })

  it('should not update the Lamport clock when receiving a larger timestamp', async () => {
    const clockA = LamportClock.init
    const clockB = LamportClock.init

    const updatedClockB = LamportClock.increment(clockB)
    const updatedClockA = LamportClock.update(clockA, updatedClockB)

    expect(LamportClock.toNumber(updatedClockA)).toBe(2)
  })
})
