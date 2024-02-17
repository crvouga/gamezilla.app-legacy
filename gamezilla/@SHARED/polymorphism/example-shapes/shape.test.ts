import { expect, test } from "bun:test"
import { area, perimeter, volume } from "./shape"
import { Circle } from "./shape-circle"
import { Rect } from "./shape-rect"
import { Octagon } from "./shape-octagon"
import { Sphere } from "./shape-sphere"

const shapes3D = [Sphere({ radius: 5 })]

const shapes2D = [
  Circle({ radius: 5 }),
  Circle({ radius: 10 }),
  Octagon({ side: 5 }),
  Rect({ width: 5, height: 20 }),
  Rect({ width: 10, height: 20 }),
]

test("area", () => {
  for (const shape of shapes2D) {
    expect(area(shape)).toBeNumber()
  }
})

test("perimeter", () => {
  for (const shape of shapes2D) {
    expect(perimeter(shape)).toBeNumber()
  }
})

test("volume", () => {
  for (const shape of shapes3D) {
    expect(volume(shape)).toBeNumber()
  }
})
