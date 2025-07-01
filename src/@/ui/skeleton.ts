import { h } from '~/@/vdom/h'

export const Skeleton = (props: { class?: string }) => {
  return h('div', { class: `animate-pulse bg-neutral-800 rounded ${props.class ?? ''}` })
}
