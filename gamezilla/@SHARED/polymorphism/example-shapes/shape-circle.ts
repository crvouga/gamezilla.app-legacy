import { Shape2D, area, perimeter } from "./shape"

export type Circle = {
  Shape: "circle"
  Shape2D: "circle"
  radius: number
}

const isCircle = (shape: Shape2D): shape is Circle => shape.Shape2D === "circle"

area.implement(isCircle, (shape) => Math.PI * shape.radius ** 2)

perimeter.implement(isCircle, (shape) => 2 * Math.PI * shape.radius)

export const Circle = (input: { radius: number }): Circle => ({
  ...input,
  Shape2D: "circle",
  Shape: "circle",
})
