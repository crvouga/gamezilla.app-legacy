import { type Shape, area, perimeter, scale } from './shape'

export type Rect = {
  Shape: 'rect'
  Shape2D: 'rect'
  width: number
  height: number
}

const isRect = (shape: Shape): shape is Rect => shape.Shape === 'rect' && 'Shape2D' in shape && shape.Shape2D === 'rect'

area.implement(isRect, (shape) => shape.width * shape.height)

perimeter.implement(isRect, (shape) => 2 * (shape.width + shape.height))

scale.implement(isRect, (shape, scaleBy) =>
  Rect({
    width: shape.width * scaleBy,
    height: shape.height * scaleBy
  })
)

export const Rect = (input: { width: number; height: number }): Rect => ({
  ...input,
  Shape2D: 'rect',
  Shape: 'rect'
})
