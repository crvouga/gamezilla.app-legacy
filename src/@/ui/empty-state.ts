import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import { Typography } from './typography'

export const EMPTY_STATE_TEST_ID = 'empty-state'

export const EmptyState = (input: { renderIcon: (input: { class: string }) => VDom; label: TranslatedText }) => {
  return h(
    Box,
    {
      class: 'flex h-full w-full flex-1 flex-col items-center justify-center gap-2 px-6 text-center',
      'data-testid': EMPTY_STATE_TEST_ID,
    },
    [
      h(Box, { class: 'flex flex-col items-center justify-center gap-2 pb-20' }, [
        input.renderIcon({
          class: 'size-14 opacity-60 text-white',
        }),
        h(Typography, {
          variant: 'body',
          text: input.label,
          class: 'pb-3 text-lg font-semibold opacity-60',
        }),
      ]),
    ],
  )
}
