import { perimeter, area, Shape } from "./shape"

export type Circle = {
  shape: "circle"
  radius: number
}

const isCircle = (shape: Shape): shape is Circle => shape.shape === "circle"

area.implement(isCircle, (shape) => Math.PI * shape.radius ** 2)

perimeter.implement(isCircle, (shape) => 2 * Math.PI * shape.radius)

export const Circle = (input: { radius: number }): Circle => ({
  shape: "circle",
  ...input,
})
