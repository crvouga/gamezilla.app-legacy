import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'

export const Skeleton = (props: { class?: string }) => {
  return h(Box, { class: `animate-pulse bg-neutral-800 rounded ${props.class ?? ''}` })
}
