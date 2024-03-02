import { expect, test } from "test"
import { batchMsgs } from "./update"

test("batchMsgs", () => {
  const expected = [{ t: "foo" }, { t: "bar" }, { t: "baz" }]
  const input = [
    null,
    { t: "foo" },
    [null, [{ t: "bar" }, undefined]],
    [{ t: "baz" }, undefined],
  ]
  const actual = batchMsgs(input)
  expect(actual).toEqual(expected)
})
