import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const Gutter = (props: { variant: 'drawer' | 'screen'; children?: VDom }) => {
  return h('div', { className: 'space-y-4' }, [props.children])
}
