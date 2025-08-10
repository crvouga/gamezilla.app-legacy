import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { sx } from './theme/theme'

export const Gutter = (props: { variant: 'drawer' | 'screen'; children?: VDom[] }) => {
  return h(
    Box,
    {
      style: sx({ padding: 4 }),
    },
    props.children,
  )
}
