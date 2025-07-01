import { v } from '~/@/vdom/v'

export type IconInput = {
  className?: string
  [key: string]: any
}

export const IconShared = (props: { className?: string; children: string }) => {
  return v('svg', { className: props.className, fill: 'currentColor', viewBox: '0 0 24 24' }, [props.children])
}
