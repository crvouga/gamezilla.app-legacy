import { h } from '~/@/vdom/h'
import { Svg } from '../vdom/primitives/svg/svg'

export type IconInput = {
  class?: string
  [key: string]: any
}

export const IconShared = (props: { class?: string; children: string }) => {
  return h(Svg, { class: props.class, fill: 'currentColor', viewBox: '0 0 24 24' }, [props.children])
}
