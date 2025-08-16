import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import { Typography } from './typography'
import { sx } from '../vdom/style/sx'

export const EmptyState = (input: {
  renderIcon: (input: { style: Record<string, unknown> }) => VDom
  label: TranslatedText
}) => {
  return h(
    Box,
    {
      style: sx({
        flexDirection: 'col',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textColor: 'neutral-400',
        flex: 1,
      }),
    },
    [
      input.renderIcon({
        style: sx({
          size: 14,
          opacity: 60,
          textColor: 'neutral-400',
        }),
      }),
      h(Typography, {
        variant: 'body',
        text: input.label,
        style: sx({
          paddingBottom: 3,
          fontSize: 'lg',
          fontWeight: 'bold',
          opacity: 60,
          textColor: 'neutral-400',
        }),
      }),
    ],
  )
}
