import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import { Typography } from './typography'
import { sx } from './theme/theme'

export const EMPTY_STATE_TEST_ID = 'empty-state'

export const EmptyState = (input: {
  renderIcon: (input: { style: Record<string, unknown> }) => VDom
  label: TranslatedText
}) => {
  return h(
    Box,
    {
      style: sx({
        height: 'full',
        width: 'full',
        flex: 1,
        flexDirection: 'col',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingX: 6,
        textAlign: 'center',
      }),
      'data-testid': EMPTY_STATE_TEST_ID,
    },
    [
      h(
        Box,
        {
          style: sx({
            flexDirection: 'col',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            paddingBottom: 20,
          }),
        },
        [
          input.renderIcon({
            style: sx({
              size: 14,
              opacity: 60,
              textColor: 'white',
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
            }),
          }),
        ],
      ),
    ],
  )
}
