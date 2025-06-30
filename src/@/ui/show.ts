import type { VDom } from '~/@/vdom/vdom'

export const Show = (props: { when: boolean; children: VDom }) => {
  return props.when ? props.children : null
}
