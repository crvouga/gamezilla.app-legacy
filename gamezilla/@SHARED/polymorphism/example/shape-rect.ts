//
//
//

import { Shape, area, perimeter } from "./shape"

export type Rect = {
  tag: "rect"
  width: number
  height: number
}

const isRect = (shape: Shape): shape is Rect => shape.tag === "rect"

area.implement(isRect, (shape) => shape.width * shape.height)

perimeter.implement(isRect, (shape) => 2 * (shape.width + shape.height))

export const Rect = (width: number, height: number): Rect => ({
  tag: "rect",
  width,
  height,
})
