import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import { Typography } from './typography'

export const EMPTY_STATE_TEST_ID = 'empty-state'

export const EmptyState = (input: {
  renderIcon: (input: { class: string }) => VDom
  label: TranslatedText
  // action?: {
  //   label: TranslatedText
  //   onClick: () => void
  //   renderIconStart?: (input: { class?: string }) => VDom
  // } | null
}) => {
  return h(
    'div',
    {
      class: 'flex h-full w-full flex-1 flex-col items-center justify-center gap-2 px-6 text-center',
      'data-testid': EMPTY_STATE_TEST_ID,
    },
    [
      h('div', { class: 'flex flex-col items-center justify-center gap-2 pb-20' }, [
        input.renderIcon({ class: 'size-14 opacity-60' }),
        h(Typography, { variant: 'body', text: input.label, class: 'pb-3 text-lg font-semibold opacity-60' }),
        // {input.action && (
        //   <Button
        //     text={input.action.label}
        //     color='primary'
        //     variant='contained'
        //     onClick={input.action.onClick}
        //     renderIconStart={input.action.renderIconStart}
        //   />
        // )}
      ]),
    ],
  )
}
