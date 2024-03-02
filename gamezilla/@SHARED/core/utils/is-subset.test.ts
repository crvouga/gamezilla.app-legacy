import { expect, test } from "test"
import { isSubset } from "./is-subset"

const eq = <A>(a: A, b: A) => a === b

test("isSubset", () => {
  expect(isSubset(eq, [], [])).toBe(true)
  expect(isSubset(eq, [], ["a"])).toBe(true)
  expect(isSubset(eq, ["a"], ["a"])).toBe(true)
  expect(isSubset(eq, ["a"], ["a", "b"])).toBe(true)
  expect(isSubset(eq, ["a"], [])).toBe(false)
  expect(isSubset(eq, ["a", "b"], ["a"])).toBe(false)
})
