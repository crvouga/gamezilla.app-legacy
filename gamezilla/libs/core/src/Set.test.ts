import { Set } from "./Set"

const { size, toArray, fromArray, union, intersect, diff } = Set

describe("Set data structure", () => {
  it("only allows unique elements", () => {
    const set = fromArray([1, 2, 2, 3, 3, 3, 4, 4, 4, 4])
    const expectation = [1, 2, 3, 4]
    const actual = toArray(set)
    expect(expectation).toEqual(actual)
  })

  it("union", () => {
    const a = fromArray([1, 2, 3])
    const b = fromArray([2, 3, 4])
    const c = union(a, b)
    const expectation = [1, 2, 3, 4]
    const actual = toArray(c)
    expect(expectation).toEqual(actual)
  })

  it("intersection", () => {
    const a = fromArray([1, 2, 3])
    const b = fromArray([2, 3, 4])
    const c = intersect(a, b)
    const expectation = [2, 3]
    const actual = toArray(c)
    expect(expectation).toEqual(actual)
  })

  it("difference", () => {
    const a = fromArray([1, 2, 3])
    const b = fromArray([2, 3, 4])
    const c = diff(a, b)
    const expectation = [1]
    const actual = toArray(c)
    expect(expectation).toEqual(actual)
  })

  it("size", () => {
    const a = fromArray(["a"])
    const b = fromArray(["a", "a"])
    const c = fromArray(["a", "b", "c"])

    expect(size(a)).toEqual(1)
    expect(size(b)).toEqual(1)
    expect(size(c)).toEqual(3)
  })
})
