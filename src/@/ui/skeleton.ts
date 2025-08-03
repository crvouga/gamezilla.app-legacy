import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { theme } from './theme/theme'

export const Skeleton = (props: { style?: Record<string, unknown> }) => {
  return h(Box, {
    style: {
      ...theme({
        //  animation: 'pulse',
        backgroundColor: 'neutral-800',
        rounded: 'full',
      }),
      ...props.style,
    },
  })
}
