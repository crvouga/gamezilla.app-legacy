import { Shape, area, perimeter, scale } from "./shape"

export type Circle = {
  Shape: "circle"
  Shape2D: "circle"
  radius: number
}

const isCircle = (shape: Shape): shape is Circle =>
  shape.Shape === "circle" && "Shape2D" in shape && shape.Shape2D === "circle"

area.implement(isCircle, (shape) => Math.PI * shape.radius ** 2)

perimeter.implement(isCircle, (shape) => 2 * Math.PI * shape.radius)

scale.implement(isCircle, (shape, scaleBy) => ({
  ...shape,
  radius: shape.radius * scaleBy,
}))

export const Circle = (input: { radius: number }): Circle => ({
  ...input,
  Shape2D: "circle",
  Shape: "circle",
})
