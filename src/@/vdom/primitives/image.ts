import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { IMAGE_TAG } from '../tags'

export type ImageProps = PrimitiveProps & {
  src: string
  alt: string
  children?: VDom[]
}

export const Image = ({ children, ...props }: ImageProps) => {
  return h(IMAGE_TAG, props, children)
}
