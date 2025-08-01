import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { CANVAS_TAG } from '../tags'

export type CanvasProps = PrimitiveProps & {
  onCreateContext: (gl: WebGLRenderingContext) => void
}

export const Canvas = ({ children, ...props }: CanvasProps) => {
  return h(CANVAS_TAG, props, children)
}
