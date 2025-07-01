import { v } from '~/@/vdom/v'

export type IconInput = {
  class?: string
  [key: string]: any
}

export const IconShared = (props: { class?: string; children: string }) => {
  return v('svg', { class: props.class, fill: 'currentColor', viewBox: '0 0 24 24' }, [props.children])
}
