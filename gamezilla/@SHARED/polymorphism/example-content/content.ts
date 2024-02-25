import { definePolymorphicFunction } from "../polymorphic-function"

export type Content = {
  Content: string
}

export const renderHTML =
  definePolymorphicFunction<(content: Content) => string>()
