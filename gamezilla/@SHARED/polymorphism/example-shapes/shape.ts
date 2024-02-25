import { definePolymorphicFunction } from "../polymorphic-function"

export type Shape = {
  Shape: string
}

export type Shape2D = Shape & {
  Shape2D: string
}

export type Shape3D = Shape & {
  Shape3D: string
}

export const area = definePolymorphicFunction<(shape: Shape2D) => number>(
  () => 0,
)

export const perimeter = definePolymorphicFunction<(shape: Shape2D) => number>(
  () => 0,
)

export const volume = definePolymorphicFunction<(shape: Shape3D) => number>(
  () => 0,
)

export const surfaceArea = definePolymorphicFunction<
  (shape: Shape3D) => number
>(() => 0)

export const scale = definePolymorphicFunction<
  (shape: Shape, scaleBy: number) => Shape
>((shape) => shape)
