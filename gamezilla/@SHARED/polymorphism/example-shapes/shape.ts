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

export const area = definePolymorphicFunction<Shape2D, number>(() => 0)

export const perimeter = definePolymorphicFunction<Shape2D, number>(() => 0)

export const volume = definePolymorphicFunction<Shape3D, number>(() => 0)

export const surfaceArea = definePolymorphicFunction<Shape3D, number>(() => 0)

export const scale = definePolymorphicFunction<
  Shape,
  (scaleBy: number) => Shape
>((shape) => () => shape)
