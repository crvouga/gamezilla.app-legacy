import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/box'
import type { VDom } from '~/@/vdom/vdom'

export const Gutter = (props: { variant: 'drawer' | 'screen'; children?: VDom }) => {
  return h(Box, { class: 'space-y-4' }, [props.children])
}
