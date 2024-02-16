import { premieter, area, Shape } from "./shape"

export type Circle = {
  tag: "circle"
  radius: number
}

const isCircle = (shape: Shape): shape is Circle => shape.tag === "circle"

area.implement(
  isCircle,
  (shape): number =>
    // @ts-ignore
    Math.PI * shape.radius ** 2,
)

premieter.implement(
  isCircle,
  (shape) =>
    // @ts-ignore
    2 * Math.PI * shape.radius,
)
