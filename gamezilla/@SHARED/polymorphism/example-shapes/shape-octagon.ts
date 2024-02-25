import { Shape, area, perimeter, scale } from "./shape"

export type Octagon = {
  Shape: "octagon"
  Shape2D: "octagon"
  side: number
}

const isOctagon = (shape: Shape): shape is Octagon =>
  shape.Shape === "octagon" && "Shape2D" in shape && shape.Shape2D === "octagon"

area.implement(isOctagon, (shape) => 2 * (1 + Math.SQRT2) * shape.side ** 2)

perimeter.implement(isOctagon, (shape) => 8 * shape.side)

scale.implement(isOctagon, (shape, scaleBy) => ({
  ...shape,
  side: shape.side * scaleBy,
}))

export const Octagon = (input: { side: number }): Octagon => ({
  ...input,
  Shape2D: "octagon",
  Shape: "octagon",
})
