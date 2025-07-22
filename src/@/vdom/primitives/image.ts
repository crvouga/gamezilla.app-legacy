import { h, IntrinsicAttributes } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const Image = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  return h(
    // @ts-ignore
    'img',
    props,
    children,
  )
}
