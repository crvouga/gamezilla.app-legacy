import { h, IntrinsicAttributes, tag } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const IMAGE_TAG = tag('img')

export const Image = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  return h(IMAGE_TAG, props, children)
}
