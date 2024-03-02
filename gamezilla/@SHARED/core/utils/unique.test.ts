import { expect, test } from "test"
import { unique } from "./unique"

const strEq = (s1: unknown, s2: unknown) => String(s1) === String(s2)

test("unique", () => {
  expect(unique(strEq, [1, "1", 2, 1])).toEqual([1, 2])
  expect(unique(strEq, [{}, {}])).toEqual([{}])
  expect(unique(strEq, [1, "1", 1])).toEqual([1])
  expect(unique(strEq, ["1", 1, 1])).toEqual(["1"])
})
