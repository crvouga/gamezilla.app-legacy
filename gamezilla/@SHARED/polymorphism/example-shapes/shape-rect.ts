import { Shape, area, perimeter } from "./shape"

export type Rect = {
  shape: "rect"
  width: number
  height: number
}

const isRect = (shape: Shape): shape is Rect => shape.shape === "rect"

area.implement(isRect, (shape) => shape.width * shape.height)

perimeter.implement(isRect, (shape) => 2 * (shape.width + shape.height))

export const Rect = (input: { width: number; height: number }): Rect => ({
  ...input,
  shape: "rect",
})
