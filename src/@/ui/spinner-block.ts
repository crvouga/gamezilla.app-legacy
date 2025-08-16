import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Spinner } from './spinner'
import { sx } from './theme/theme'

export const LoadingState = (props: { style?: Record<string, unknown> }) => {
  return h(
    Box,
    {
      style: {
        ...sx({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', size: 20 }),
        ...props.style,
      },
    },
    [h(Spinner, { style: { ...sx({ size: 20 }) } })],
  )
}
