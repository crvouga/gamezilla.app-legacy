import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { sx } from './theme/theme'

export const Skeleton = (props: { style?: Record<string, unknown> }) => {
  return h(Box, {
    style: {
      ...sx({
        //  animation: 'pulse',
        backgroundColor: 'neutral-800',
        rounded: 'full',
      }),
      ...props.style,
    },
  })
}
