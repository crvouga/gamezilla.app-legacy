import { definePolymorphicFunction } from "../polymorphic-function"

export type RenderableContent = {
  Content: string
}

export const renderHTML = definePolymorphicFunction<RenderableContent, string>(
  () => "",
)
