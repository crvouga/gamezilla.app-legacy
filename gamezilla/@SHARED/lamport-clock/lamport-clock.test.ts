import { describe, expect, it } from "test"
import { LamportClock } from "./lamport-clock"

describe(import.meta.file, () => {
  it("should update the Lamport clock when receiving a smaller timestamp", () => {
    const clockA = LamportClock.init
    const clockB = LamportClock.init

    const updatedClockA = LamportClock.increment(clockA)
    const updatedClockB = LamportClock.update(clockB, updatedClockA)

    expect(LamportClock.toNumber(updatedClockB)).toBe(2)
  })

  it("should not update the Lamport clock when receiving an equal timestamp", () => {
    const clockA = LamportClock.init
    const clockB = LamportClock.init

    const updatedClockA = LamportClock.increment(clockA)
    const updatedClockB = LamportClock.update(clockB, updatedClockA)

    const updatedClockB2 = LamportClock.update(updatedClockB, updatedClockA)

    expect(LamportClock.toNumber(updatedClockB2)).toBe(3)
  })

  it("should not update the Lamport clock when receiving a larger timestamp", () => {
    const clockA = LamportClock.init
    const clockB = LamportClock.init

    const updatedClockB = LamportClock.increment(clockB)
    const updatedClockA = LamportClock.update(clockA, updatedClockB)

    expect(LamportClock.toNumber(updatedClockA)).toBe(2)
  })
})
