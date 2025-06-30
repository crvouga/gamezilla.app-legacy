import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import { Typography } from './typography'

export const EMPTY_STATE_TEST_ID = 'empty-state'

export const EmptyState = (input: {
  renderIcon: (input: { className: string }) => VDom
  label: TranslatedText
  // action?: {
  //   label: TranslatedText
  //   onClick: () => void
  //   renderIconStart?: (input: { className?: string }) => VDom
  // } | null
}) => {
  return h(
    'div',
    {
      className: 'flex h-full w-full flex-1 flex-col items-center justify-center gap-2 px-6 text-center',
      'data-testid': EMPTY_STATE_TEST_ID,
    },
    [
      h('div', { className: 'flex flex-col items-center justify-center gap-2 pb-20' }, [
        input.renderIcon({ className: 'size-14 opacity-60' }),
        h(Typography, { variant: 'body', text: input.label, className: 'pb-3 text-lg font-semibold opacity-60' }),
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
