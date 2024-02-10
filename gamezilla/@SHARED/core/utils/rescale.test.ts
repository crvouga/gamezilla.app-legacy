import { expect, test } from "bun:test"
import { rescale } from "./rescale"

test("rescale", () => {
    expect(rescale({ value: 10, from: [0, 100], to: [0, 10] })).toEqual(1)
})
