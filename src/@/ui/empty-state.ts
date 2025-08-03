import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import { Typography } from './typography'
import { theme } from './theme/theme'

export const EMPTY_STATE_TEST_ID = 'empty-state'

export const EmptyState = (input: {
  renderIcon: (input: { style: Record<string, unknown> }) => VDom
  label: TranslatedText
}) => {
  return h(
    Box,
    {
      style: theme({
        height: 'full',
        width: 'full',
        flex: 1,
        flexDirection: 'col',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 6,
        textAlign: 'center',
      }),
      'data-testid': EMPTY_STATE_TEST_ID,
    },
    [
      h(
        Box,
        {
          style: theme({
            flexDirection: 'col',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            pb: 20,
          }),
        },
        [
          input.renderIcon({
            style: theme({
              size: 14,
              opacity: 60,
              textColor: 'white',
            }),
          }),
          h(Typography, {
            variant: 'body',
            text: input.label,
            style: theme({
              pb: 3,
              textSize: 'lg',
              fontWeight: 'bold',
              opacity: 60,
            }),
          }),
        ],
      ),
    ],
  )
}
