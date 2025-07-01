import { v } from '~/@/vdom/v'

export const Skeleton = (props: { class?: string }) => {
  return v('div', { class: `animate-pulse bg-neutral-800 rounded ${props.class ?? ''}` })
}
