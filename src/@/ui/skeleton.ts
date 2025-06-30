import { h } from '~/@/vdom/h'

export const Skeleton = (props: { className?: string }) => {
  return h('div', { className: `animate-pulse bg-neutral-800 rounded ${props.className ?? ''}` })
}
