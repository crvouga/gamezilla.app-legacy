import { definePolymorphicFunction } from "../polymorphic-function"

export type Content = {
  Content: string
}

export const renderHTML = definePolymorphicFunction<Content, string>(() => "")
