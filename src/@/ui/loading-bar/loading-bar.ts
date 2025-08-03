import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { theme } from '../theme/theme'

type LoadingBarInput = {
  disabled?: boolean
  style?: Record<string, unknown>
  color?: string
  backgroundColor?: string
}

export const LoadingBar = (input: LoadingBarInput) => {
  return h(
    Box,
    {
      style: {
        ...theme({
          position: 'relative',
          height: 2,
          overflow: 'hidden',
        }),
        ...input.style,
      },
    },
    [
      !input.disabled &&
        h(Box, {
          style: theme({
            position: 'absolute',
            height: 'full',
            // width: '1/2',
            rounded: 'full',
            backgroundColor: 'blue-500',
          }),
        }),
    ],
  )
}
