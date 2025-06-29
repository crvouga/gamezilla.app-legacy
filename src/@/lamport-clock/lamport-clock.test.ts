import { describe, expect, test } from '~/@/test-runner'
import { LamportClock } from './lamport-clock'

describe('LamportClock', () => {
  test('should update the Lamport clock when receiving a smaller timestamp', async () => {
    const clockA = LamportClock.init
    const clockB = LamportClock.init

    const updatedClockA = LamportClock.increment(clockA)
    const updatedClockB = LamportClock.update(clockB, updatedClockA)

    expect(LamportClock.toNumber(updatedClockB)).toEqual(2)
  })

  test('should not update the Lamport clock when receiving an equal timestamp', async () => {
    const clockA = LamportClock.init
    const clockB = LamportClock.init

    const updatedClockA = LamportClock.increment(clockA)
    const updatedClockB = LamportClock.update(clockB, updatedClockA)

    const updatedClockB2 = LamportClock.update(updatedClockB, updatedClockA)

    expect(LamportClock.toNumber(updatedClockB2)).toEqual(3)
  })

  test('should not update the Lamport clock when receiving a larger timestamp', async () => {
    const clockA = LamportClock.init
    const clockB = LamportClock.init

    const updatedClockB = LamportClock.increment(clockB)
    const updatedClockA = LamportClock.update(clockA, updatedClockB)

    expect(LamportClock.toNumber(updatedClockA)).toEqual(2)
  })
})
