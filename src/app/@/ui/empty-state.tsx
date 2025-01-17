import type { VDom } from '~/@/vdom/vdom'
import { Typography } from './typography'
import { TranslatedText } from '~/@/l18n'

export const EMPTY_STATE_TEST_ID = 'empty-state'

export const EmptyState = ({
  renderIcon,
  label,
}: {
  renderIcon: (input: { className: string }) => VDom
  label: TranslatedText
}) => {
  return (
    <div
      className='absolute inset-0 flex h-full w-full flex-1 flex-col items-center justify-center gap-2 px-5 text-center opacity-60'
      data-testid={EMPTY_STATE_TEST_ID}
    >
      <div className='flex flex-col items-center justify-center gap-3 pb-20'>
        <Typography variant='title' text={label} />

        <div className='bg-paper flex aspect-square flex-col items-center justify-center rounded-full p-7'>
          {renderIcon({
            className: 'h-14 w-14',
          })}
        </div>
      </div>
    </div>
  )
}
