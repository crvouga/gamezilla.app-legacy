import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import type { VDom } from '~/@/vdom/vdom'
import { IconCheckmarkCircle, IconExclamationCircle, IconInfoCircle } from './icon'
import { sx } from '../vdom/style/sx'

export const AlertError = ({ text }: { text?: string }) => {
  return h(
    Box,
    {
      role: 'alert',
      'aria-label': text,
      style: sx({
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
        rounded: 'md',
        backgroundColor: 'red-500',
        padding: 4,
        textColor: 'white',
      }),
    },
    [
      h(Box, { style: sx({ paddingRight: 2 }) }, [h(IconExclamationCircle, { style: sx({ size: 6 }) })]),
      h(Text, { text: text ?? '' }),
    ],
  )
}

export const AlertInfo = ({ children }: { children?: VDom }) => {
  return h(
    Box,
    {
      style: sx({
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
        rounded: 'md',
        backgroundColor: 'blue-500',
        padding: 4,
        textColor: 'white',
      }),
    },
    [h(Box, { style: sx({ paddingRight: 2 }) }, [h(IconInfoCircle, { style: sx({ size: 6 }) })]), children],
  )
}

export const AlertSuccess = ({ children }: { children?: VDom }) => {
  return h(
    Box,
    {
      style: sx({
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
        rounded: 'md',
        backgroundColor: 'green-500',
        padding: 4,
        textColor: 'white',
      }),
    },
    [h(Box, { style: sx({ paddingRight: 2 }) }, [h(IconCheckmarkCircle, { style: sx({ size: 6 }) })]), children],
  )
}
