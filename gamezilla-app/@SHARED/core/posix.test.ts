import { describe, expect, it } from "bun:test"
import { Posix } from "."

describe(import.meta.file, () => {
  it("should get current posix time", () => {
    expect(Posix.now()).toBeCloseTo(Date.now())
  })
  it("should be able to be percise to the millisecond", () => {
    const now = Posix.now({
      precision: "milliseconds",
    })
    const now2 = Posix.now({
      precision: "milliseconds",
    })
    expect(now).toEqual(now2)
  })

  it("should be able to be percise to the second", () => {
    const now = Posix.now({
      precision: "minutes",
    })
    const now2 = Posix.now({
      precision: "minutes",
    })
    expect(now).toEqual(now2)
  })
})
