import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'

export const Gutter = (props: { variant: 'drawer' | 'screen'; children?: VDom }) => {
  return v('div', { class: 'space-y-4' }, [props.children])
}
