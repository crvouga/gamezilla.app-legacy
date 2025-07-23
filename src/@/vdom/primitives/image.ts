import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/vdom-engine/impl'
import { IntrinsicAttributes } from '~/@/vdom/vdom-engine/interface'
import { IMAGE_TAG } from '../tags'

export const Image = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  return h(IMAGE_TAG, props, children)
}
