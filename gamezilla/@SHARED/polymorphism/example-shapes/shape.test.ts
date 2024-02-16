import { test } from "bun:test"
import { area, perimeter } from "./shape"
import { Circle } from "./shape-circle"
import { Rect } from "./shape-rect"

const shapes = [
  Circle({ radius: 5 }),
  Circle({ radius: 10 }),
  Rect({ width: 5, height: 20 }),
  Rect({ width: 10, height: 20 }),
]

test("area", () => {
  for (const shape of shapes) {
    console.log(shape)
    console.log("Area:", area(shape))
  }
})

test("perimeter", () => {
  for (const shape of shapes) {
    console.log(shape)
    console.log("Perimeter:", perimeter(shape))
  }
})
