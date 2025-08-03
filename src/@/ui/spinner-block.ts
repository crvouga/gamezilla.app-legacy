import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Spinner } from './spinner'
import { theme } from './theme/theme'

export const SpinnerBlock = (props: { style?: Record<string, unknown> }) => {
  return h(
    Box,
    {
      style: {
        ...theme({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', size: 20 }),
        ...props.style,
      },
    },
    [h(Spinner, { style: { ...theme({ size: 20 }) } })],
  )
}
