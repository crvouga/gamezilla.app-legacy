import { perimeter, area, Shape } from "./shape"

export type Circle = {
  tag: "circle"
  radius: number
}

const isCircle = (shape: Shape): shape is Circle => shape.tag === "circle"

area.implement(isCircle, (shape) => Math.PI * shape.radius ** 2)

perimeter.implement(isCircle, (shape) => 2 * Math.PI * shape.radius)

export const Circle = (radius: number): Circle => ({
  tag: "circle",
  radius,
})
