import { definePolymorphicFunction } from "../polymorphic-function"

export type Shape = {
  tag: string
}

export const area = definePolymorphicFunction<(shape: Shape) => number>()

export const premieter = definePolymorphicFunction<(shape: Shape) => number>()
