import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { Typography } from './typography'

export const EMPTY_STATE_TEST_ID = 'empty-state'

export const EmptyState = (input: { renderIcon: (input: { className: string }) => VDom; label: TranslatedText }) => {
  return (
    <div
      className='flex h-full w-full flex-1 flex-col items-center justify-center gap-2 px-6 text-center opacity-60'
      data-testid={EMPTY_STATE_TEST_ID}
    >
      <div className='flex flex-col items-center justify-center gap-2 pb-20'>
        {input.renderIcon({ className: 'size-14' })}
        <Typography variant='body' text={input.label} className='text-lg font-semibold' />
      </div>
    </div>
  )
}
