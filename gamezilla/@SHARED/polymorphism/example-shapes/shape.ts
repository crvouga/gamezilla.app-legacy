import { definePolymorphicFunction } from "../polymorphic-function"

export type Shape = {
  shape: string
}

export const area = definePolymorphicFunction<Shape, number>()

export const perimeter = definePolymorphicFunction<Shape, number>()
