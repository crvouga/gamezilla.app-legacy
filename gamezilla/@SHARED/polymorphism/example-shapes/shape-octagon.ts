import { Shape2D, area, perimeter } from "./shape"

export type Octagon = {
  Shape: "octagon"
  Shape2D: "octagon"
  side: number
}

const isOctagon = (shape: Shape2D): shape is Octagon =>
  shape.Shape2D === "octagon"

const USE_IMPLEMENTATION = false
if (USE_IMPLEMENTATION) {
  area.implement(isOctagon, (shape) => 2 * (1 + Math.SQRT2) * shape.side ** 2)

  perimeter.implement(isOctagon, (shape) => 8 * shape.side)
}

export const Octagon = (input: { side: number }): Octagon => ({
  ...input,
  Shape2D: "octagon",
  Shape: "octagon",
})
